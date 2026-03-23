#backend/app/models/auth_models.py
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    id: str | None = None
    username: str
    full_name: str | None = None
    email: str | None = None
    role: str
    angkatan: int | None = None
    status: str = "active"

class MahasiswaRegister(BaseModel):
    username: str
    full_name: str
    password: str = Field(..., min_length=6)
    role: str = "mahasiswa"

class LoginIn(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

