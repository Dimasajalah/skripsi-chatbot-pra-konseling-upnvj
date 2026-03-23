# backend/app/services/chatbot_handler.py
from datetime import datetime
from app.services.notification_service import NotificationService
from app.services.emotion_service import EmotionService
from app.dependencies import get_nlp_pipeline, get_intent_recognizer
from app.services.chatbot_core import process_chat_message
from app.utils.time_utils import now

def handle_chat_message_ws(*, text: str, session_id: str, user: dict, db):
    emotion_service = EmotionService()
    nlp = get_nlp_pipeline()
    intent_recognizer = get_intent_recognizer()

    # Panggil process_chat_message dan simpan hasilnya
    data = process_chat_message(
        text=text,
        session_id=session_id,
        user_id=user["user_id"],
        nlp=nlp,
        emotion_service=emotion_service,
        intent_recognizer=intent_recognizer,
        db=db,
    )

    # ===== SIMPAN METADATA NLP SEPERTI REST FLOW =====
    sessions = db["chat_sessions"]
    session = sessions.find_one({"session_id": session_id})

    if session:
        # update emotion history
        sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {
                    "emotion_history": {
                        "label": data.get("emotion"),
                        "confidence": data.get("emotion_confidence", 0.0),
                        "timestamp": now(),
                    }
                }
            },
        )

    # simpan pesan user
    db["messages"].insert_one(
        {
            "session_id": session_id,
            "isi_pesan": text,
            "pengirim": "user",
            "waktu_kirim": now(),
            "emotion": data.get("emotion", ""),
            "emotion_confidence": data.get("emotion_confidence", 0.0),
            "intent": data.get("intent", ""),
            "intent_confidence": data.get("intent_confidence", 0.0),
            "risk": data.get("risk", {}),
        }
    )

    # simpan snapshot per message
    db["emotion_logs"].insert_one(
        {
            "session_id": session_id,
            "text": text,
            "emotion": data.get("emotion", ""),
            "emotion_confidence": data.get("emotion_confidence", 0.0),
            "intent": data.get("intent", ""),
            "intent_confidence": data.get("intent_confidence", 0.0),
            "created_at": now(),
        }
    )

    # notifikasi kritis
    if data.get("risk", {}).get("is_critical"):
        NotificationService(db).create_critical_notification(
            session_id=session_id,
            mahasiswa_id=user["user_id"],
            risk_data=data.get("risk", {}),
        )

    # ===== RETURN WS PAYLOAD (1:1 dengan REST) =====
    response_payload = {
        "type": "chat_response",
        "session_id": data.get("session_id", ""),
        "chatbot_text": data.get("chatbot_text", ""),
        "response": data.get("response", {}),
        "emotion": data.get("emotion")
        or data.get("response", {}).get("empathetic_text", ""),
        "emotion_confidence": data.get("emotion_confidence", 0.0),
        "intent": data.get("intent") or data.get("response", {}).get("intent", ""),
        "intent_confidence": data.get("intent_confidence", 0.0),
        "risk": data.get("risk", {}),
        "response_type": data.get("response_type")
        or data.get("response", {}).get("response_type", "general"),
        "meta": data.get("meta")
        or data.get("response", {}).get(
            "meta", {"is_low_confidence": False, "threshold": 0.5}
        ),
    }

    return response_payload
