from sqlalchemy import Column, Integer, String, DateTime, func, Text, Float, JSON, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# --- ASSOCIATION TABLES ---

# Association table for Idea and Tag
idea_tags_table = Table(
    "idea_tags",
    Base.metadata,
    Column("idea_id", Integer, ForeignKey("ideas.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True)
)

# --- MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=True)
    auth_provider = Column(String(50), default="demo")
    external_id = Column(String(200), nullable=True)
    role = Column(String(50), default="user") # user, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ideas = relationship("Idea", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String(200), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    username = Column(String(100), default="Anonymous") # Legacy for non-auth ideas
    department = Column(String(100), nullable=True)
    status = Column(String(50), default="New") 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vote_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Store embedding as JSON string or large text
    embedding = Column(Text, nullable=True) 

    # Relationships
    tags = relationship("Tag", secondary=idea_tags_table, back_populates="ideas")
    ai_values = relationship("AIValue", back_populates="idea", cascade="all, delete-orphan")
    user = relationship("User", back_populates="ideas")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(20), default="#5C6B73")

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
    field_type = Column(String(20), default="numeric")
    options = Column(Text, nullable=True)
    is_active = Column(Integer, default=1)

    values = relationship("AIValue", back_populates="field", cascade="all, delete-orphan")

class AIValue(Base):
    __tablename__ = "ai_values"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"))
    field_id = Column(Integer, ForeignKey("ai_fields.id"))
    value = Column(String(200))

    idea = relationship("Idea", back_populates="ai_values")
    field = relationship("AIField", back_populates="values")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id"), index=True)
    username = Column(String(100), nullable=True) # Legacy
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="votes")
