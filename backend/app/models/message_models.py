#backend/app/models/message_models.py
from pydantic import BaseModel, Field
from datetime import datetime

class MessageBase(BaseModel):
    session_id: str
    isi_pesan: str
    pengirim: str            
    waktu_kirim: datetime = Field(default_factory=datetime.utcnow)
    emotion: str | None = None
    emotion_confidence: float | None = None
    intent: str | None = None
    intent_confidence: float | None = None
    response_type: str | None = None
    risk: dict | None = None
    response_text: str | None = None

class MessageOut(MessageBase):
    message_id: str
    class Config:
        orm_mode = True
