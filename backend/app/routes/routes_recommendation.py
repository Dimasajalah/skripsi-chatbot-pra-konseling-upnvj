# backend/app/routes/routes_recommendation.py
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.db import get_db
from app.dependencies import verify_jwt_user, verify_jwt_role
from app.models.recommendation_models import RecommendationOut
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

router = APIRouter(tags=["Recommendation"])

@router.get("/")
def list_recommendations(db=Depends(get_db), user: dict = Depends(verify_jwt_user)):
    data = db["recommendations"].find().sort("created_at", -1)

    return {
        "recommendations": [
            {
                "recommendation_id": str(r["_id"]),
                "session_id": r.get("session_id"),
                "text": r.get("text"),
                "created_at": r.get("created_at"),
            }
            for r in data
        ]
    }

@router.get("/session/{session_id}", response_model=RecommendationOut | None)
def get_recommendation_by_session(
    session_id: str,
    db=Depends(get_db),
    user: dict = Depends(verify_jwt_role(["psikolog", "admin", "mahasiswa"]))
):
    # Ambil session dulu
    session = db["chat_sessions"].find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    # Role check
    if user["role"] == "mahasiswa" and session.get("mahasiswa_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak untuk mahasiswa ini")
    if user["role"] == "psikolog" and session.get("psikolog_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak untuk psikolog ini")

    # Ambil recommendation (boleh None)
    rec = db["recommendations"].find_one({"session_id": session_id})

    return None if not rec else RecommendationOut(
        recommendation_id=str(rec["_id"]),
        session_id=rec["session_id"],
        text=rec.get("teks_rekomendasi", ""),
        created_at=rec.get("waktu_rekomendasi")
    )

@router.delete("/{recommendation_id}")
def delete_recommendation(
    recommendation_id: str, db=Depends(get_db), user: dict = Depends(verify_jwt_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")

    try:
        oid = ObjectId(recommendation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID tidak valid")

    result = db["recommendations"].delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation tidak ditemukan")

    return {"message": "Recommendation berhasil dihapus"}
