# backend/app/dependencies.py
from functools import lru_cache
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.utils.intent_recognizer import IntentRecognizer
from app.config import settings
from app.services.classify_service import ClassificationService
from app.nlp.nlp_pipeline import NLPPipeline
from app.services.emotion_service import EmotionService
from functools import lru_cache
import os
import joblib

security = HTTPBearer()
SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM

def verify_jwt(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def verify_jwt_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt(credentials.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden (Admin only)")

    return {
        "user_id": payload.get("user_id"),
        "username": payload.get("username"),
        "role": payload.get("role")
    }

def verify_jwt_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt(credentials.credentials)

    if payload.get("role") != "mahasiswa":
        raise HTTPException(status_code=403, detail="Forbidden (Mahasiswa only)")

    if "user_id" not in payload:
        raise HTTPException(
            status_code=401,
            detail="Token tidak valid (user_id tidak ditemukan)"
        )

    return {
        "user_id": payload["user_id"],
        "role": payload.get("role"),
        "username": payload.get("username")
    }

def verify_jwt_psikolog(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt(credentials.credentials)
    if payload.get("role") != "psikolog":
        raise HTTPException(status_code=403, detail="Forbidden (Psikolog only)")

    return {
        "user_id": payload.get("user_id"),
        "username": payload.get("username"),
        "role": payload.get("role")
    }

def verify_jwt_role(allowed_roles: list):
    def _verify(credentials: HTTPAuthorizationCredentials = Depends(security)):
        payload = verify_jwt(credentials.credentials)
        if payload.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden ({allowed_roles} only)"
            )
        return payload
    return _verify


def verify_token(token: str):
    """
    Verifikasi JWT untuk WebSocket.
    Mengembalikan user dict jika valid, None jika tidak valid atau expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "user_id": payload.get("user_id"),
            "username": payload.get("username"),
            "role": payload.get("role")
        }
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None   
    
# Tambahkan ini di dependencies.py
def get_current_mahasiswa(user: dict = Depends(verify_jwt_user)):
    """
    Return the current mahasiswa user dict
    """
    return user

def get_authenticated_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt(credentials.credentials)
    return payload

def require_role(role: str):
    def _check(user=Depends(get_authenticated_user)):
        if user["role"] != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _check

@lru_cache()
def get_nlp_pipeline():
    return NLPPipeline(
        emotion_service=EmotionService(),
        intent_recognizer=IntentRecognizer(
            model_path=settings.INTENT_MODEL_PATH,
            label_encoder_path=settings.INTENT_LABEL_ENCODER_PATH
        )
    )

@lru_cache()
def get_classifier():
    return ClassificationService()

@lru_cache()
def get_intent_recognizer():
    # Instantiate IntentRecognizer lazily; avoid pre-loading arbitrary model at import time
    try:
        return IntentRecognizer(
            model_path=settings.INTENT_MODEL_PATH,
            label_encoder_path=settings.INTENT_LABEL_ENCODER_PATH
        )
    except Exception:
        # If model files are missing or invalid, raise a clear HTTPException when dependency used
        raise
