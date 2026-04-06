from sqlalchemy import Column, Integer, String, DateTime, func, Text, Float, JSON, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# Association table for Idea and Tag
idea_tags_table = Table(
    "idea_tags",
    Base.metadata,
    Column("idea_id", Integer, ForeignKey("ideas.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True)
)

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    username = Column(String(100), default="Anonymous")
    department = Column(String(100), nullable=True)
    status = Column(String(50), default="New") # New, Reviewing, In Progress, On Roadmap, Implemented, Already Exists
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vote_count = Column(Integer, default=0)
    
    # Store embedding as JSON string or large text
    embedding = Column(Text, nullable=True) 

    # Relationships
    tags = relationship("Tag", secondary=idea_tags_table, back_populates="ideas")
    ai_values = relationship("AIValue", back_populates="idea", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(20), default="#5C6B73") # Default to muted slate

    ideas = relationship("Idea", secondary=idea_tags_table, back_populates="tags")

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(50), primary_key=True)
    value = Column(String(200))

class AIField(Base):
    __tablename__ = "ai_fields"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    field_type = Column(String(20), default="numeric") # "numeric" or "categorical"
    options = Column(Text, nullable=True) # JSON string for categorical options
    is_active = Column(Integer, default=1) # 1 for active, 0 for inactive

    values = relationship("AIValue", back_populates="field", cascade="all, delete-orphan")

class AIValue(Base):
    __tablename__ = "ai_values"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"))
    field_id = Column(Integer, ForeignKey("ai_fields.id"))
    value = Column(String(200)) # Store as string regardless of type, cast as needed

    idea = relationship("Idea", back_populates="ai_values")
    field = relationship("AIField", back_populates="values")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, index=True)
    username = Column(String(100)) # Simple vote tracking for MVP (no auth)
