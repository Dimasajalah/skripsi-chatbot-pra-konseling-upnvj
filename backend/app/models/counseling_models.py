#backend/app/models/counseling_models.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CounselingSession(BaseModel):
    student_id: str
    psychologist_id: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: str = "pending" 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    

