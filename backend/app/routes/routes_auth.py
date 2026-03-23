#backend/app/routes/routes_auth.py
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.auth import authenticate_user, create_access_token, hash_password, get_user_by_username, decode_token
from app.models.auth_models import LoginIn, MahasiswaRegister, TokenResponse, UserBase
from app.db import db
from bson import ObjectId

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@router.post("/token", response_model=TokenResponse)
async def login_admin(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = create_access_token({"username": user["username"], "role": user["role"], "user_id": str(user["_id"])})
    return TokenResponse(access_token=token)

@router.post("/login_mahasiswa", response_model=TokenResponse)
async def login_mahasiswa(data: LoginIn):
    user = authenticate_user(data.username, data.password)
    if not user or user.get("role") != "mahasiswa":
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = create_access_token({"username": user["username"], "role": user["role"], "user_id": str(user["_id"])})
    return TokenResponse(access_token=token)

@router.post("/register_mahasiswa", response_model=TokenResponse)
async def register_mahasiswa(data: MahasiswaRegister):
    existing = get_user_by_username(data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")

    hashed_pwd = hash_password(data.password)

    user_doc = {
        "username": data.username,
        "full_name": data.full_name,
        "email": None,          # opsional, bisa diisi di use case profil
        "angkatan": None,       # opsional
        "hashed_password": hashed_pwd,
        "role": "mahasiswa",
        "status": "active",
        "created_at": datetime.utcnow()
    }

    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({
        "username": user_doc["username"],
        "role": user_doc["role"],
        "user_id": str(user_doc["_id"])
    })

    return TokenResponse(access_token=token)

@router.get("/me", response_model=UserBase)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)

    user = db.users.find_one(
        {"_id": ObjectId(payload["user_id"])},
        {"hashed_password": 0}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user["_id"] = str(user["_id"])
    user["id"] = user["_id"]
    return user

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    angkatan: Optional[int] = None
    password: Optional[str] = Field(None, min_length=6)

@router.post("/login_psikolog", response_model=TokenResponse)
async def login_psikolog(data: LoginIn):
    user = authenticate_user(data.username, data.password)
    if not user or user.get("role") != "psikolog":
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = create_access_token({
        "username": user["username"],
        "role": user["role"],
        "user_id": str(user["_id"])
    })
    return TokenResponse(access_token=token)   

@router.get("/identify", response_model=UserBase)
async def identify_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)

    user = db.users.find_one(
        {"_id": ObjectId(payload["user_id"])},
        {"hashed_password": 0}
    )

    if not user:
        raise HTTPException(status_code=401, detail="User tidak valid")

    user["_id"] = str(user["_id"])
    user["id"] = user["_id"]
    return user

@router.put("/profile")
async def update_profile(data: ProfileUpdate, token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    username = user.get("username")

    if not username:
        raise HTTPException(status_code=401, detail="User tidak valid")

    update_fields = {}

    if data.full_name is not None:
        update_fields["full_name"] = data.full_name

    if data.email is not None:
        update_fields["email"] = data.email

    if data.angkatan is not None:
        update_fields["angkatan"] = data.angkatan

    if data.password:
        update_fields["hashed_password"] = hash_password(data.password)

    if not update_fields:
        raise HTTPException(status_code=400, detail="Tidak ada data yang diperbarui")

    db.users.update_one(
        {"_id": ObjectId(user["user_id"])},
        {"$set": update_fields}
    )

    return {"message": "Profil berhasil diperbarui"}
