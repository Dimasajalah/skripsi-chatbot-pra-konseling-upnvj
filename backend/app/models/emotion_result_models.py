# backend/app/models/emotion_result_models.py
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Optional

from typing import Optional

class EmotionResultOut(BaseModel):
    emotion_id: str
    session_id: str
    label_emosi: str
    tingkat_kepercayaan: float

    confidence_type: Optional[str] = None
    aggregation_method: Optional[str] = None

    created_at: datetime

