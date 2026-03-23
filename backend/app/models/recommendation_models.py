#backend/app/models/recommendation_models.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RecommendationBase(BaseModel):
    session_id: str
    text_rekomendasi: str
    created_at: datetime = datetime.utcnow()

class RecommendationOut(BaseModel):
    recommendation_id: str
    session_id: str
    text: str                # ← sesuai MongoDB
    created_at: datetime     # ← sesuai MongoDB
