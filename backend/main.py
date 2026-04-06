from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
import uuid
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

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

# --- AUTH LOGIC ---

security = HTTPBearer()

ADMIN_EMAILS = [
    "connor.mckinnis@apexnc.org",
    "fernando.guzman@apexnc.org",
    "conrad.sain@apexnc.org"
]

def get_current_user(auth: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(database.get_db)):
    token = auth.credentials
    session = db.query(models.Session).filter(models.Session.token == token).first()
    if not session or session.expires_at < datetime.now():
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return session.user

def get_optional_current_user(auth: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False)), db: Session = Depends(database.get_db)):
    if not auth:
        return None
    token = auth.credentials
    session = db.query(models.Session).filter(models.Session.token == token).first()
    if not session or session.expires_at < datetime.now():
        return None
    return session.user

def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@app.post("/auth/login", response_model=schemas.SessionResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    email = request.email.lower().strip()
    if not email.endswith("@apexnc.org"):
        raise HTTPException(status_code=400, detail="Only @apexnc.org emails allowed for this demo")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        role = "admin" if email in ADMIN_EMAILS else "user"
        user = models.User(
            email=email,
            display_name=request.display_name,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create session
    token = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=7)
    session = models.Session(user_id=user.id, token=token, expires_at=expires_at)
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {"token": token, "expires_at": expires_at, "user": user}

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/auth/logout")
def logout(auth: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(database.get_db)):
    token = auth.credentials
    db.query(models.Session).filter(models.Session.token == token).delete()
    db.commit()
    return {"detail": "Logged out"}

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
        
        # Pre-populate settings if empty 
        if db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first() is None:
            db.add(models.Setting(key="similarity_threshold", value="0.8"))
        if db.query(models.Setting).filter(models.Setting.key == "new_idea_ttl").first() is None:
            db.add(models.Setting(key="new_idea_ttl", value="2"))
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
def map_idea_to_response(idea: models.Idea, db: Session, current_user: Optional[models.User] = None) -> schemas.IdeaResponse:
    metadata = {val.field.label: val.value for val in idea.ai_values}
    
    # Calculate is_new
    ttl_setting = db.query(models.Setting).filter(models.Setting.key == "new_idea_ttl").first()
    ttl_days = int(ttl_setting.value) if ttl_setting else 2
    from datetime import datetime, timezone, timedelta
    is_new = (datetime.now(timezone.utc) - idea.created_at.replace(tzinfo=timezone.utc)) < timedelta(days=ttl_days)

    ai_values = [
        schemas.AIFieldValue(
            field_id=val.field_id,
            label=val.field.label,
            value=val.value,
            field_type=val.field.field_type
        ) for val in idea.ai_values
    ]
    # Check if current user voted
    has_voted = False
    if current_user:
        has_voted = db.query(models.Vote).filter(models.Vote.idea_id == idea.id, models.Vote.user_id == current_user.id).first() is not None

    return schemas.IdeaResponse(
        id=idea.id,
        text=idea.text,
        description=idea.description,
        username=idea.username,
        department=idea.department,
        status=idea.status,
        is_new=is_new,
        has_voted=has_voted,
        created_at=idea.created_at,
        vote_count=idea.vote_count,
        has_embedding=bool(idea.embedding),
        tags=[schemas.Tag.model_validate(t) for t in idea.tags],
        ai_metadata=metadata,
        ai_values=ai_values,
        user=schemas.UserResponse.model_validate(idea.user) if idea.user else None
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

@app.post("/ideas/{idea_id}/process", response_model=schemas.IdeaResponse)
def trigger_ai_process(idea_id: int, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    """
    Manually trigger/re-trigger AI processing for a spark.
    Admin only.
    """
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    background_tasks.add_task(process_ai_async, idea_id)
    return map_idea_to_response(idea, db, current_user=current_user)

# --- IDEAS ---

@app.post("/ideas/", response_model=schemas.IdeaResponse)
def create_idea(idea: schemas.IdeaCreate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Create base idea immediately
    db_idea = models.Idea(
        text=idea.text,
        description=idea.description,
        username=current_user.display_name or current_user.email,
        department=idea.department,
        user_id=current_user.id
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    
    # 2. Queue AI processing in background
    background_tasks.add_task(process_ai_async, db_idea.id)
    
    return map_idea_to_response(db_idea, db, current_user=current_user)

@app.get("/ideas/", response_model=List[schemas.IdeaResponse])
def read_ideas(sort_by: str = "new", skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: Optional[models.User] = Depends(get_optional_current_user)):
    query = db.query(models.Idea)
    if sort_by == "trending":
        query = query.order_by(models.Idea.vote_count.desc(), models.Idea.created_at.desc())
    else: # default to new
        query = query.order_by(models.Idea.created_at.desc())
    
    db_ideas = query.offset(skip).limit(limit).all()
    return [map_idea_to_response(i, db, current_user=current_user) for i in db_ideas]

@app.get("/ideas/{idea_id}", response_model=schemas.IdeaResponse)
def get_idea(idea_id: int, db: Session = Depends(database.get_db), current_user: Optional[models.User] = Depends(get_optional_current_user)):
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return map_idea_to_response(idea, db, current_user=current_user)

@app.patch("/ideas/{idea_id}", response_model=schemas.IdeaResponse)
def update_idea(idea_id: int, idea_update: schemas.IdeaUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
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
    return map_idea_to_response(db_idea, db, current_user=current_user)

@app.post("/ideas/{idea_id}/vote", response_model=schemas.IdeaResponse)
def vote_idea(idea_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    existing_vote = db.query(models.Vote).filter(models.Vote.idea_id == idea_id, models.Vote.user_id == current_user.id).first()
    idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
        
    if existing_vote:
        # Toggle: Remove vote
        db.delete(existing_vote)
        idea.vote_count = max(0, idea.vote_count - 1)
        db.commit()
        db.refresh(idea)
        return map_idea_to_response(idea, db, current_user=current_user)
        
    new_vote = models.Vote(idea_id=idea_id, user_id=current_user.id, username=current_user.email)
    db.add(new_vote)
    idea.vote_count += 1
    db.commit()
    db.refresh(idea)
    return map_idea_to_response(idea, db, current_user=current_user)

@app.get("/ideas/{idea_id}/similar", response_model=List[schemas.IdeaResponse])
def get_similar_ideas(idea_id: int, db: Session = Depends(database.get_db), current_user: Optional[models.User] = Depends(get_optional_current_user)):
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
                similar.append(map_idea_to_response(idea, db, current_user=current_user))
                
    return similar[:5]

# --- TAGS & FIELDS ---

@app.get("/tags/", response_model=List[schemas.Tag])
def read_tags(db: Session = Depends(database.get_db)):
    return db.query(models.Tag).all()

@app.post("/tags/", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    db_tag = models.Tag(name=tag.name, color=tag.color)
    db.add(db_tag)
    try:
        db.commit()
        db.refresh(db_tag)
        return db_tag
    except Exception:
        db.rollback()
        # Tag might already exist
        existing = db.query(models.Tag).filter(models.Tag.name == tag.name).first()
        if existing:
            return existing
        raise HTTPException(status_code=400, detail="Error creating tag")

@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    tag = db.query(models.Tag).filter(models.Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"detail": "Tag deleted"}

@app.get("/admin/ai-fields", response_model=List[schemas.AIField])
def read_ai_fields(db: Session = Depends(database.get_db)):
    return db.query(models.AIField).all()

@app.post("/admin/ai-fields", response_model=schemas.AIField)
def create_ai_field(field: schemas.AIFieldCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    db_field = models.AIField(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

@app.delete("/admin/ai-fields/{field_id}")
def delete_ai_field(field_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
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
def get_constellation_data(db: Session = Depends(database.get_db), current_user: Optional[models.User] = Depends(get_optional_current_user)):
    """
    Returns nodes and links for a similarity graph.
    Now includes ALL ideas, identifying those with/without embeddings.
    """
    ideas = db.query(models.Idea).all()
    nodes = []
    links = []
    
    # Pre-parse vectors
    vectors = []
    for idea in ideas:
        emb = json.loads(idea.embedding) if idea.embedding else None
        # Color based on status, but distinct color for processing
        color = "#F2A65A" if not emb else ("#2F6F5E" if idea.status == "Implemented" else "#5DA9E9" if idea.status == "In Progress" else "#5C6B73")
        
        nodes.append({
            "id": idea.id,
            "text": idea.text,
            "status": idea.status,
            "processing": emb is None,
            "color": color
        })
        if emb:
            vectors.append((idea.id, emb))
    
    # Get threshold
    threshold_setting = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    threshold = float(threshold_setting.value) if threshold_setting else 0.8

    for i, (id1, v1) in enumerate(vectors):
        # Compare with others to find links
        for j in range(i + 1, len(vectors)):
            id2, v2 = vectors[j]
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
def get_system_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
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
def get_admin_settings(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    threshold = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    ttl = db.query(models.Setting).filter(models.Setting.key == "new_idea_ttl").first()
    return {
        "similarity_threshold": float(threshold.value) if threshold else 0.8,
        "new_idea_ttl": int(ttl.value) if ttl else 2
    }

@app.patch("/admin/settings", response_model=schemas.AdminSettings)
def update_admin_settings(settings: schemas.AdminSettings, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_admin_user)):
    # Update threshold
    threshold = db.query(models.Setting).filter(models.Setting.key == "similarity_threshold").first()
    if not threshold:
        threshold = models.Setting(key="similarity_threshold", value=str(settings.similarity_threshold))
        db.add(threshold)
    else:
        threshold.value = str(settings.similarity_threshold)
    
    # Update TTL
    ttl = db.query(models.Setting).filter(models.Setting.key == "new_idea_ttl").first()
    if not ttl:
        ttl = models.Setting(key="new_idea_ttl", value=str(settings.new_idea_ttl))
        db.add(ttl)
    else:
        ttl.value = str(settings.new_idea_ttl)

    db.commit()
    return {"detail": "Settings updated"}
