# backend/app/models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    password: str
    role: str = "mahasiswa"

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    sender: str
    text: str
    timestamp: datetime

class IntentResult(BaseModel):
    intent: str
    confidence: float

class EmotionResult(BaseModel):
    label: str
    score: float

class NLPResponse(BaseModel):
    intent: IntentResult
    emotion: EmotionResult
    bot_reply: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class LoginIn(BaseModel):
    email: str
    password: str
    
class EmotionResultOut(BaseModel):
    emotion_id: str
    session_id: str
    label_emosi: str
    tingkat_kepercayaan: float
    created_at: datetime

class ChatSession(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    is_active: bool = True
    emotion_history: List[str] = []
    critical_detected: bool = False
