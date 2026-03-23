# backend/app/routes/routes_admin_register.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.db import db
from app.auth import hash_password

router = APIRouter(prefix="/auth", tags=["Admin/Psikolog Seed"])
SECRET_KEY = "12345"

class RegisterPayload(BaseModel):
    username: str
    full_name: str
    password: str
    secret_key: str

@router.post("/register_admin")
def register_admin(payload: RegisterPayload):
    if payload.secret_key != SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    existing_user = db.users.find_one({"username": payload.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username sudah ada")
    
    user_doc = {
        "username": payload.username,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user_doc)
    return {"detail": f"Admin {payload.username} berhasil dibuat."}


@router.post("/register_psikolog")
def register_psikolog(payload: RegisterPayload):
    if payload.secret_key != SECRET_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    existing_user = db.users.find_one({"username": payload.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username sudah ada")
    
    user_doc = {
        "username": payload.username,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "role": "psikolog",
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user_doc)
    return {"detail": f"Psikolog {payload.username} berhasil dibuat."}
