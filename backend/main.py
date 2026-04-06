from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json

import models
import schemas
import database
import ai_utils

# Create DB schema
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Spark Idea System MVP API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_populate():
    db = database.SessionLocal()
    try:
        # Pre-populate default tags if empty
        if db.query(models.Tag).count() == 0:
            defaults = [
                ("Infrastructure", "#5DA9E9"),
                ("Policy", "#F2A65A"),
                ("Process Improvement", "#2F6F5E"),
                ("Resident Impact", "#7BC47F")
            ]
            for name, color in defaults:
                db.add(models.Tag(name=name, color=color))
            db.commit()
            print("DB Seeded with default tags.")
        
        # Pre-populate similarity threshold setting if empty 
        if db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first() is None:
            db.add(models.Setting(key="similarity_threshold", value="0.8"))
            db.commit()
            print("DB Seeded with default settings.")

        # Pre-populate initial AI Fields
        if db.query(models.AIField).count() == 0:
            ai_defaults = [
                {
                    "label": "Implementation Difficulty",
                    "description": "How hard is this to execute? 0 is easy, 10 is near-impossible/massive project.",
                    "field_type": "numeric"
                },
                {
                    "label": "Public Impact",
                    "description": "How much will this benefit the residents of Apex? 0 is no visible impact, 10 is transformative.",
                    "field_type": "numeric"
                },
                {
                    "label": "Strategic Department",
                    "description": "Which major department should own this?",
                    "field_type": "categorical",
                    "options": json.dumps(["Public Works", "Planning", "Parks & Rec", "Police", "Fire", "Administration", "IT"])
                }
            ]
            for field in ai_defaults:
                db.add(models.AIField(**field))
            db.commit()
            print("DB Seeded with default AI Fields.")

    except Exception as e:
        print(f"Startup check failed: {e}")
        db.rollback()
    finally:
        db.close()

# Helper to map idea models to schemas with AI metadata
def map_idea_to_response(idea: models.Idea) -> schemas.IdeaResponse:
    metadata = {val.field.label: val.value for val in idea.ai_values}
    ai_values = [
        schemas.AIFieldValue(
            field_id=val.field_id,
            label=val.field.label,
            value=val.value,
            field_type=val.field.field_type
        ) for val in idea.ai_values
    ]
    return schemas.IdeaResponse(
        id=idea.id,
        text=idea.text,
        description=idea.description,
        username=idea.username,
        department=idea.department,
        status=idea.status,
        created_at=idea.created_at,
        vote_count=idea.vote_count,
        tags=[schemas.Tag.model_validate(t) for t in idea.tags],
        ai_metadata=metadata,
        ai_values=ai_values
    )

def process_ai_async(idea_id: int):
    """
    Background task to process embeddings and metadata analysis.
    """
    db = database.SessionLocal()
    try:
        db_idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
        if not db_idea:
            return

        # 1. Generate embedding
        vector = ai_utils.get_embedding(db_idea.text)
        if vector:
            db_idea.embedding = json.dumps(vector)

        # 2. Extract AI Metadata
        active_fields = db.query(models.AIField).filter(models.AIField.is_active == 1).all()
        fields_list = [
            {"label": f.label, "description": f.description, "field_type": f.field_type, "options": f.options} 
            for f in active_fields
        ]
        
        if fields_list:
            ai_results = ai_utils.analyze_spark_metadata(db_idea.text, fields_list)
            for field in active_fields:
                if field.label in ai_results:
                    val = str(ai_results[field.label])
                    db.add(models.AIValue(idea_id=db_idea.id, field_id=field.id, value=val))
                    
                    # Special Case: Auto-fill department if missing
                    if field.label == "Strategic Department" and not db_idea.department:
                        db_idea.department = val
        
        db.commit()
        print(f"AI Processing complete for idea {idea_id}")
    except Exception as e:
        print(f"Error in background AI task: {e}")
        db.rollback()
    finally:
        db.close()

# --- IDEAS ---

@app.post("/ideas/", response_model=schemas.IdeaResponse)
def create_idea(idea: schemas.IdeaCreate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # 1. Create base idea immediately
    db_idea = models.Idea(
        text=idea.text,
        description=idea.description,
        username=idea.username,
        department=idea.department
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    
    # 2. Queue AI processing in background
    background_tasks.add_task(process_ai_async, db_idea.id)
    
    return map_idea_to_response(db_idea)

@app.get("/ideas/", response_model=List[schemas.IdeaResponse])
def read_ideas(sort_by: str = "new", skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    query = db.query(models.Idea)
    if sort_by == "trending":
        query = query.order_by(models.Idea.vote_count.desc(), models.Idea.created_at.desc())
    else: # default to new
        query = query.order_by(models.Idea.created_at.desc())
    
    db_ideas = query.offset(skip).limit(limit).all()
    return [map_idea_to_response(i) for i in db_ideas]

@app.get("/ideas/{idea_id}", response_model=schemas.IdeaResponse)
def get_idea(idea_id: int, db: Session = Depends(database.get_db)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return map_idea_to_response(idea)

@app.patch("/ideas/{idea_id}", response_model=schemas.IdeaResponse)
def update_idea(idea_id: int, idea_update: schemas.IdeaUpdate, db: Session = Depends(database.get_db)):
    db_idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not db_idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    update_data = idea_update.dict(exclude_unset=True)
    if "tag_ids" in update_data:
        tag_ids = update_data.pop("tag_ids")
        tags = db.query(models.Tag).filter(models.Tag.id.in_(tag_ids)).all()
        db_idea.tags = tags
    
    for key, value in update_data.items():
        setattr(db_idea, key, value)
    
    db.commit()
    db.refresh(db_idea)
    return map_idea_to_response(db_idea)

@app.post("/ideas/{idea_id}/vote", response_model=schemas.IdeaResponse)
def vote_idea(idea_id: int, vote: schemas.VoteCreate, db: Session = Depends(database.get_db)):
    existing_vote = db.query(models.Vote).filter(models.Vote.idea_id == idea_id, models.Vote.username == vote.username).first()
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
        
    if existing_vote:
        return map_idea_to_response(idea)
        
    new_vote = models.Vote(idea_id=idea_id, username=vote.username)
    db.add(new_vote)
    idea.vote_count += 1
    db.commit()
    db.refresh(idea)
    return map_idea_to_response(idea)

@app.get("/ideas/{idea_id}/similar", response_model=List[schemas.IdeaResponse])
def get_similar_ideas(idea_id: int, db: Session = Depends(database.get_db)):
    """
    Finds similarity strictly from DB-saved embeddings. 
    Zero calls to Ollama are made here.
    """
    target = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not target or not target.embedding:
        return [] # AI hasn't finished processing this one yet
    
    target_vector = json.loads(target.embedding)
    all_ideas = db.query(models.Idea).filter(models.Idea.id != idea_id).all()
    
    threshold_setting = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    threshold = float(threshold_setting.value) if threshold_setting else 0.8
    
    similar = []
    for idea in all_ideas:
        if idea.embedding:
            # Strictly use pre-saved DB values
            sim = ai_utils.cosine_similarity(target_vector, json.loads(idea.embedding))
            if sim >= threshold:
                similar.append(map_idea_to_response(idea))
                
    return similar[:5]

# --- TAGS & FIELDS ---

@app.get("/tags/", response_model=List[schemas.Tag])
def read_tags(db: Session = Depends(database.get_db)):
    return db.query(models.Tag).all()

@app.get("/admin/ai-fields", response_model=List[schemas.AIField])
def read_ai_fields(db: Session = Depends(database.get_db)):
    return db.query(models.AIField).all()

@app.post("/admin/ai-fields", response_model=schemas.AIField)
def create_ai_field(field: schemas.AIFieldCreate, db: Session = Depends(database.get_db)):
    db_field = models.AIField(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

@app.delete("/admin/ai-fields/{field_id}")
def delete_ai_field(field_id: int, db: Session = Depends(database.get_db)):
    field = db.query(models.AIField).filter(models.AIField.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"detail": "Field deleted"}

# --- ANALYTICS ---

@app.get("/analytics/wordcloud")
def get_wordcloud_data(db: Session = Depends(database.get_db)):
    texts = [i.text for i in db.query(models.Idea.text).all()]
    return ai_utils.get_word_frequencies(texts)

@app.get("/analytics/constellation")
def get_constellation_data(db: Session = Depends(database.get_db)):
    """
    Returns nodes and links for a similarity graph.
    """
    ideas = db.query(models.Idea).all()
    nodes = []
    links = []
    
    # Pre-parse vectors
    vectors = []
    for idea in ideas:
        if idea.embedding:
            vectors.append((idea.id, json.loads(idea.embedding), idea.text, idea.status))
    
    # Get threshold
    threshold_setting = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    threshold = float(threshold_setting.value) if threshold_setting else 0.8

    for i, (id1, v1, txt1, stat1) in enumerate(vectors):
        nodes.append({
            "id": id1,
            "text": txt1,
            "status": stat1,
            "color": "#2F6F5E" if stat1 == "Implemented" else "#5DA9E9" if stat1 == "In Progress" else "#5C6B73"
        })
        
        # Compare with others to find links
        for j in range(i + 1, len(vectors)):
            id2, v2, _, _ = vectors[j]
            sim = ai_utils.cosine_similarity(v1, v2)
            if sim >= threshold:
                links.append({
                    "source": id1,
                    "target": id2,
                    "value": sim
                })
                
    return {"nodes": nodes, "links": links}

# --- ADMIN ---

@app.get("/admin/stats", response_model=schemas.SystemStats)
def get_system_stats(db: Session = Depends(database.get_db)):
    total_ideas = db.query(models.Idea).count()
    total_votes = db.query(models.Vote).count()
    
    status_counts = db.query(models.Idea.status, func.count(models.Idea.id)).group_by(models.Idea.status).all()
    dept_counts = db.query(models.Idea.department, func.count(models.Idea.id)).group_by(models.Idea.department).all()
    
    return {
        "total_ideas": total_ideas,
        "total_votes": total_votes,
        "ideas_by_status": dict(status_counts),
        "ideas_by_department": {d or "Unspecified": c for d, c in dept_counts}
    }

@app.get("/admin/settings", response_model=schemas.AdminSettings)
def get_admin_settings(db: Session = Depends(database.get_db)):
    threshold = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    return {"similarity_threshold": float(threshold.value) if threshold else 0.8}

@app.patch("/admin/settings")
def update_admin_settings(settings: schemas.AdminSettings, db: Session = Depends(database.get_db)):
    threshold = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    if not threshold:
        threshold = models.Setting(key="similarity_threshold", value=str(settings.similarity_threshold))
        db.add(threshold)
    else:
        threshold.value = str(settings.similarity_threshold)
    db.commit()
    return {"detail": "Settings updated"}
