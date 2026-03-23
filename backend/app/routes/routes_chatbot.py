# backend/app/routes/routes_chatbot.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from zoneinfo import ZoneInfo
from collections import Counter
from app.services.notification_service import NotificationService
from app.db import get_db
from app.dependencies import verify_jwt_user, get_nlp_pipeline, get_intent_recognizer
from app.nlp.nlp_pipeline import NLPPipeline
from app.services.response_mapper_advanced import generate_response
from uuid import uuid4
from app.risk_detection import calculate_session_risk, NEGATIVE_EMOTIONS, HIGH_RISK_KEYWORDS, MEDIUM_RISK_KEYWORDS, _contains_any
from app.services.chatbot_service import ChatbotService

router = APIRouter(tags=["Chatbot"])

JAKARTA_TZ = ZoneInfo("Asia/Jakarta")

def now_jakarta():
    return datetime.now(JAKARTA_TZ)

class ChatRequest(BaseModel):
    text: str
    session_id: str

@router.post("/start-session")
def start_chatbot_session(user: dict = Depends(verify_jwt_user), db=Depends(get_db)):
    session_id = str(uuid4())

    db["chat_sessions"].insert_one(
        {
            "session_id": session_id,
            "user_id": user["user_id"],
            "created_by_role": user.get("role"),
            "username": user.get("username"),
            "created_at": now_jakarta(),
            "ended_at": None,
            "is_active": True,
            "critical_detected": False,
            "emotion_history": [],
        }
    )

    return {"session_id": session_id, "status": "started"}


@router.post("/message")
async def chatbot_message(
    data: ChatRequest,
    user: dict = Depends(verify_jwt_user),
    nlp: NLPPipeline = Depends(get_nlp_pipeline),
    intent_recognizer = Depends(get_intent_recognizer),
    db=Depends(get_db),
):
    if not data.text or len(data.text.strip()) < 2:
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong")

    sessions = db["chat_sessions"]
    session = sessions.find_one({"session_id": data.session_id})

    if not session:
        raise HTTPException(
            status_code=400,
            detail="Session tidak valid. Silakan mulai sesi chatbot terlebih dahulu.",
        )

    if session.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    if not session.get("is_active", True):
        raise HTTPException(status_code=400, detail="Session sudah ditutup")

    chatbot_service = ChatbotService(
        db=db,
        nlp=nlp,
        intent_recognizer=intent_recognizer,
    )

    result = chatbot_service.process_message(
        text=data.text,
        session_id=data.session_id,
        user=user,
    )

    return {"message": result}

@router.post("/end-session/{session_id}")
def end_chatbot_session(session_id: str, user: dict = Depends(verify_jwt_user), db=Depends(get_db)):
    sessions = db["chat_sessions"]
    session = sessions.find_one({"session_id": session_id})

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    if session.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    history = session.get("emotion_history", [])
    if not history:
        raise HTTPException(status_code=400, detail="Tidak ada data emosi dalam sesi")

    # Ambil label emosi dari history
    history_emotions = [
        item["label"] if isinstance(item, dict) and "label" in item
        else str(item)
        for item in history
    ]
    
    n_total = len(history_emotions)
    if n_total == 0:
        raise HTTPException(
            status_code=400,
            detail="Tidak ada data emosi valid dalam sesi"
        )
    n_neg = sum(1 for e in history_emotions if e in NEGATIVE_EMOTIONS)
    n_pos = sum(1 for e in history_emotions if e == "senang")
    n_neutral = n_total - n_neg - n_pos
    # ===============================
    # CEK APAKAH PERNAH ADA KRITIKAL
    # ===============================
    messages = list(db["messages"].find({
        "session_id": session_id,
        "pengirim": "user"
    }))

    any_critical = any(
        m.get("risk", {}).get("is_critical") is True
        for m in messages
    )
    # ===============================
    # SESSION LEVEL RISK CALCULATION
    # ===============================
    risk_result = calculate_session_risk(history_emotions)
    risk_level = risk_result["risk_level"]
    
    if any_critical:
        risk_level = "Kritikal"

    percentage_negative = risk_result["percentage_negative"]
    max_consecutive = risk_result["max_consecutive_negative"]

    is_critical = any_critical or (risk_level == "Kritikal")

    # ===============================
    # HITUNG METRIK TAMBAHAN
    # ===============================
    # Distribusi emosi
    emotion_distribution = {
        "senang": n_pos,
        "sedih": sum(1 for e in history_emotions if e == "sedih"),
        "marah": sum(1 for e in history_emotions if e == "marah"),
        "cemas": sum(1 for e in history_emotions if e == "cemas"),
        "netral": n_neutral,
        "total": n_total
    }

    # Persentase tiap emosi
    emotion_percentages = {
        "senang_pct": round((emotion_distribution["senang"] / n_total) * 100, 2),
        "sedih_pct": round((emotion_distribution["sedih"] / n_total) * 100, 2),
        "marah_pct": round((emotion_distribution["marah"] / n_total) * 100, 2),
        "cemas_pct": round((emotion_distribution["cemas"] / n_total) * 100, 2),
        "netral_pct": round((n_neutral / n_total) * 100, 2)
    }

    # Persentase positif & netral
    percentage_positive = emotion_percentages["senang_pct"]
    percentage_neutral = round((n_neutral / n_total) * 100, 2)

    # Hitung streak negatif tambahan
    streaks = []
    current_streak = 0
    for e in history_emotions:
        if e in NEGATIVE_EMOTIONS:
            current_streak += 1
        else:
            if current_streak > 0:
                streaks.append(current_streak)
            current_streak = 0
    if current_streak > 0:
        streaks.append(current_streak)
    avg_streak = round(sum(streaks) / len(streaks), 2) if streaks else 0
    streak_ge2 = sum(1 for s in streaks if s >= 2)

    # Hitung jumlah keyword HIGH / MEDIUM
    messages = list(db["messages"].find({"session_id": session_id}))

    high_keyword_count = sum(
        1 for m in messages
        if _contains_any(m.get("isi_pesan", ""), HIGH_RISK_KEYWORDS)
    )

    medium_keyword_count = sum(
        1 for m in messages
        if _contains_any(m.get("isi_pesan", ""), MEDIUM_RISK_KEYWORDS)
    )

    # Emosi terakhir
    last_emotion = history_emotions[-1] if history_emotions else "senang"

    # ===============================
    # INSERT EMOTION RESULT
    # ===============================
    emotion_doc = {
        "session_id": session_id,
        "user_id": session["user_id"],
        "risk_level": risk_level,
        "percentage_negative": percentage_negative,
        "max_consecutive_negative": max_consecutive,
        "total_messages": n_total,
        "emotion_distribution": emotion_distribution,
        "emotion_percentages": emotion_percentages,
        "percentage_positive": percentage_positive,
        "percentage_neutral": percentage_neutral,
        "average_negative_streak": avg_streak,
        "streak_ge2_count": streak_ge2,
        "high_risk_keyword_count": high_keyword_count,
        "medium_risk_keyword_count": medium_keyword_count,
        "last_emotion": last_emotion,
        "created_at": now_jakarta(),
        "source": "chatbot_session_end",
    }

    existing = db["emotion_results"].find_one(
        {"session_id": session_id, "source": "chatbot_session_end"}
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Emotion result untuk session ini sudah dibuat"
        )

    emotion_id = db["emotion_results"].insert_one(emotion_doc).inserted_id

    # ===============================
    # INSERT RECOMMENDATION
    # ===============================
    if risk_level == "Kritikal":
        recommendation_text = "Terdeteksi tingkat risiko KRITIKAL. Segera dijadwalkan konseling lanjutan."
    elif risk_level == "Tinggi":
        recommendation_text = "Terdeteksi tingkat risiko TINGGI. Disarankan segera melakukan konseling."
    elif risk_level == "Waspada":
        recommendation_text = "Teridentifikasi kondisi WASPADA. Anda dapat mempertimbangkan konseling."
    else:
        recommendation_text = (
            "Sesi pra-konseling telah selesai. "
            "Jika Anda merasa membutuhkan bantuan lebih lanjut, "
            "Anda dapat menjadwalkan sesi konseling dengan psikolog kampus "
            "melalui menu penjadwalan."
        )
    rec_id = db["recommendations"].insert_one(
        {
            "session_id": session_id,
            "user_id": session["user_id"],
            "teks_rekomendasi": recommendation_text,
            "waktu_rekomendasi": now_jakarta(),
        }
    ).inserted_id

    # ===============================
    # UPDATE CHAT SESSION
    # ===============================
    sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "is_active": False,
                "ended_at": now_jakarta(),
                "critical_detected": is_critical,
                "last_emotion_result_id": emotion_id,
                "last_recommendation_id": rec_id,
                # simpan semua metrik tambahan
                "emotion_distribution": emotion_distribution,
                "emotion_percentages": emotion_percentages,
                "percentage_negative": percentage_negative,
                "percentage_positive": percentage_positive,
                "percentage_neutral": percentage_neutral,
                "max_consecutive_negative": max_consecutive,
                "average_negative_streak": avg_streak,
                "streak_ge2_count": streak_ge2,
                "high_risk_keyword_count": high_keyword_count,
                "medium_risk_keyword_count": medium_keyword_count,
                "last_emotion": last_emotion,
            }
        },
    )
    
    # ===============================
    # NOTIFIKASI KRITIKAL
    # ===============================
    if risk_level in {"Tinggi", "Kritikal"}:
        NotificationService(db).create_critical_notification(
            session_id=session_id,
            user_id=session["user_id"],
            risk_data=emotion_doc,
        )

    # ===============================
    # RESPONSE AKHIR
    # ===============================
    action = None
    if risk_level in {"Tinggi", "Kritikal"}:
        action = "redirect_booking"

    return {
        "session_id": session_id,
        "critical_detected": is_critical,
        "final_message": recommendation_text,
        "action": action,
        "risk_level": risk_level,
        "percentage_negative": percentage_negative,
        "max_consecutive_negative": max_consecutive,
        "total_messages": n_total,
        "emotion_distribution": emotion_distribution,
        "emotion_percentages": emotion_percentages,
        "percentage_positive": percentage_positive,
        "percentage_neutral": percentage_neutral,
        "average_negative_streak": avg_streak,
        "streak_ge2_count": streak_ge2,
        "high_risk_keyword_count": high_keyword_count,
        "medium_risk_keyword_count": medium_keyword_count,
        "last_emotion": last_emotion,
        "recommendation": recommendation_text,
    }