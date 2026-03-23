# backend/app/routes/routes_emotion_result.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from bson import ObjectId
from requests import session
from app.db import get_db
from pydantic import BaseModel
from app.dependencies import (
    verify_jwt_user,
    get_current_mahasiswa,
    verify_jwt_role,
    verify_jwt_admin,
)
from app.models.emotion_result_models import EmotionResultOut
from datetime import datetime, timedelta, timezone

router = APIRouter(tags=["EmotionResult"])

WIB = timezone(timedelta(hours=7))


class EmotionResultOut(BaseModel):
    emotion_id: Optional[str]
    session_id: str
    user_id: str
    label_emosi: Optional[str]
    last_emotion: Optional[str]
    risk_level: Optional[str]
    percentage_negative: Optional[float]
    percentage_positive: Optional[float]
    percentage_neutral: Optional[float]
    total_messages: Optional[int]
    max_consecutive_negative: Optional[int]
    average_negative_streak: Optional[float]
    streak_ge2_count: Optional[int]
    high_risk_keyword_count: Optional[int]
    medium_risk_keyword_count: Optional[int]
    emotion_distribution: Optional[dict]
    emotion_percentages: Optional[dict]
    emotion_created_at: Optional[str]  # ✅ UBAH JADI STRING
    source: Optional[str]
    session_created_at: Optional[str]  # ✅ UBAH JADI STRING
    session_ended_at: Optional[str]  # ✅ UBAH JADI STRING
    session_is_active: Optional[bool]
    critical_detected: Optional[bool]
    full_name: Optional[str]
    created_by_role: Optional[str]


@router.get("/session/{session_id}", response_model=EmotionResultOut)
def get_emotion_result_by_session(
    session_id: str,
    db=Depends(get_db),
    user=Depends(verify_jwt_role(["mahasiswa", "admin", "psikolog"])),
):

    role = user.get("role")

    query = {"session_id": session_id}

    if role == "mahasiswa":
        session = db["chat_sessions"].find_one(
            {"session_id": session_id, "user_id": user["user_id"]}
        )
        if not session:
            raise HTTPException(status_code=403, detail="Akses ditolak")
    else:
        session = db["chat_sessions"].find_one({"session_id": session_id})

    result = db["emotion_results"].find_one({"session_id": session_id})

    if not result:
        raise HTTPException(status_code=404, detail="EmotionResult tidak ditemukan")

    return {
        "emotion_id": str(result["_id"]),
        "session_id": result["session_id"],
        "label_emosi": result.get("label_emosi", result.get("label")),
        "tingkat_kepercayaan": result.get(
            "tingkat_kepercayaan", result.get("confidence", 0.0)
        ),
        "confidence_type": result.get("confidence_type"),
        "aggregation_method": result.get("aggregation_method"),
        "created_at": result["created_at"],
    }


@router.get("/")
def list_emotion_results(db=Depends(get_db), user: dict = Depends(verify_jwt_admin)):
    data = db["emotion_results"].find().sort("created_at", -1)

    return {
        "emotion_results": [
            {
                "emotion_id": str(r["_id"]),
                "session_id": r.get("session_id"),
                "label_emosi": r.get("label_emosi", r.get("label")),
                "tingkat_kepercayaan": r.get(
                    "tingkat_kepercayaan", r.get("confidence", 0.0)
                ),
                "created_at": r.get("created_at"),
            }
            for r in data
        ]
    }

@router.get("/me", response_model=List[EmotionResultOut])
def get_my_emotion_results(
    user: dict = Depends(verify_jwt_role(["mahasiswa"])),
    db=Depends(get_db),
):
    results_cursor = db["chat_sessions"].aggregate(
        [
            {
                "$match": {
                    "user_id": user["user_id"],
                    "is_active": False,
                }
            },
            {
                "$lookup": {
                    "from": "emotion_results",
                    "localField": "session_id",
                    "foreignField": "session_id",
                    "as": "emotion",
                }
            },

            # 🔥 FIX JOIN KE USERS (pakai ObjectId)
            {
                "$lookup": {
                    "from": "users",
                    "let": {"uid": {"$toObjectId": "$user_id"}},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", "$$uid"]
                                }
                            }
                        }
                    ],
                    "as": "user",
                }
            },

            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {"$unwind": {"path": "$emotion", "preserveNullAndEmptyArrays": True}},

            {
                "$project": {
                    "session_id": 1,
                    "user_id": 1,
                    "session_created_at": "$created_at",
                    "session_ended_at": "$ended_at",
                    "session_is_active": "$is_active",
                    "emotion_created_at": "$emotion.created_at",
                    "full_name": "$user.full_name",
                    "created_by_role": 1,
                    "critical_detected": 1,
                    "emotion_id": {"$ifNull": ["$emotion._id", None]},
                    "label_emosi": {"$ifNull": ["$emotion.last_emotion", None]},
                    "last_emotion": "$emotion.last_emotion",
                    "risk_level": "$emotion.risk_level",
                    "percentage_negative": "$emotion.percentage_negative",
                    "percentage_positive": "$emotion.percentage_positive",
                    "percentage_neutral": "$emotion.percentage_neutral",
                    "total_messages": "$emotion.total_messages",
                    "max_consecutive_negative": "$emotion.max_consecutive_negative",
                    "average_negative_streak": "$emotion.average_negative_streak",
                    "streak_ge2_count": "$emotion.streak_ge2_count",
                    "high_risk_keyword_count": "$emotion.high_risk_keyword_count",
                    "medium_risk_keyword_count": "$emotion.medium_risk_keyword_count",
                    "emotion_distribution": "$emotion.emotion_distribution",
                    "emotion_percentages": "$emotion.emotion_percentages",
                    "source": "$emotion.source",
                }
            },
            {"$sort": {"session_created_at": -1, "emotion_created_at": -1}},
        ]
    )

    def to_wib(dt):
        if not dt:
            return None
        return (
            dt.replace(tzinfo=timezone.utc)
            .astimezone(WIB)
            .isoformat()   # ✅ FIX frontend invalid date
        )

    results = []
    for r in results_cursor:
        results.append(
            {
                "emotion_id": str(r["emotion_id"]) if r.get("emotion_id") else None,
                "session_id": r.get("session_id"),
                "user_id": r.get("user_id"),
                "label_emosi": r.get("label_emosi"),
                "last_emotion": r.get("last_emotion"),
                "risk_level": r.get("risk_level"),
                "percentage_negative": r.get("percentage_negative"),
                "percentage_positive": r.get("percentage_positive"),
                "percentage_neutral": r.get("percentage_neutral"),
                "total_messages": r.get("total_messages"),
                "max_consecutive_negative": r.get("max_consecutive_negative"),
                "average_negative_streak": r.get("average_negative_streak"),
                "streak_ge2_count": r.get("streak_ge2_count"),
                "high_risk_keyword_count": r.get("high_risk_keyword_count"),
                "medium_risk_keyword_count": r.get("medium_risk_keyword_count"),
                "emotion_distribution": r.get("emotion_distribution"),
                "emotion_percentages": r.get("emotion_percentages"),
                "source": r.get("source"),
                "session_created_at": to_wib(r.get("session_created_at")),
                "session_ended_at": to_wib(r.get("session_ended_at")),
                "emotion_created_at": to_wib(r.get("emotion_created_at")),
                "session_is_active": r.get("session_is_active"),
                "critical_detected": r.get("critical_detected"),
                "full_name": r.get("full_name"),
                "created_by_role": r.get("created_by_role"),
            }
        )

    return results

@router.get("/session/{session_id}/overview")
def get_session_overview(
    session_id: str,
    db=Depends(get_db),
    user: dict = Depends(verify_jwt_role(["psikolog", "admin"])),
):
    # Ambil hasil emosi
    emotion = db["emotion_results"].find_one({"session_id": session_id})
    if not emotion:
        raise HTTPException(status_code=404, detail="EmotionResult tidak ditemukan")

    # Ambil rekomendasi
    recommendation = db["recommendations"].find_one({"session_id": session_id})

    return {
        "session_id": session_id,
        "emotion_result": {
            "label_emosi": emotion.get("label_emosi", emotion.get("label")),
            "tingkat_kepercayaan": emotion.get(
                "tingkat_kepercayaan", emotion.get("confidence", 0.0)
            ),
        },
        "recommendation": (
            recommendation.get("text_rekomendasi") if recommendation else None
        ),
    }
