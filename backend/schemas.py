from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List

class TagBase(BaseModel):
    name: str
    color: str = "#5C6B73"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class IdeaBase(BaseModel):
    text: str = Field(..., max_length=300, description="The idea text, limited to 300 characters for brevity.")
    description: Optional[str] = None
    username: Optional[str] = "Anonymous"
    department: Optional[str] = None

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    text: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class AdminSettings(BaseModel):
    similarity_threshold: float = 0.8
    # Add more settings here later

class AIFieldValue(BaseModel):
    field_id: int
    label: str
    value: str
    field_type: str

class AIFieldBase(BaseModel):
    label: str
    description: Optional[str] = None
    field_type: str = "numeric" # "numeric" or "categorical"
    options: Optional[str] = None # JSON string if categorical
    is_active: bool = True

class AIFieldCreate(AIFieldBase):
    pass

class AIField(AIFieldBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class IdeaResponse(IdeaBase):
    id: int
    status: str
    created_at: datetime
    vote_count: int
    tags: List[Tag] = []
    ai_metadata: dict = {} # Map of label -> value for easy frontend use
    ai_values: List[AIFieldValue] = [] # More detailed list if needed

    model_config = ConfigDict(from_attributes=True)

class VoteCreate(BaseModel):
    username: str

class SystemStats(BaseModel):
    total_ideas: int
    total_votes: int
    ideas_by_status: dict
    ideas_by_department: dict
