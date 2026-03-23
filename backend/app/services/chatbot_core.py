#backend/app/services/chatbot_core.py
from datetime import datetime
from app.risk_detection import detect_risk
from app.services.response_mapper_advanced import generate_response

EMOTION_THRESHOLD = 0.5

def process_chat_message(
    *,
    text: str,
    session_id: str,
    user_id: str,
    nlp,
    emotion_service,
    intent_recognizer,
    db
):
    # =======================
    # NLP
    # =======================
    cleaned = nlp.preprocess(text)

    emotion_result = emotion_service.predict(cleaned)
    emotion_label = emotion_result["label"]
    emotion_conf = emotion_result["confidence"]

    intent_label, intent_conf = intent_recognizer.predict_intent(cleaned)

    risk = detect_risk(
        text=text,
        emotion_label=emotion_label,
        intent_label=intent_label
    )

    # =======================
    # SAVE USER MESSAGE
    # =======================
    db["messages"].insert_one({
        "session_id": session_id,
        "user_id": user_id,
        "isi_pesan": text,
        "pengirim": "user",
        "waktu_kirim": datetime.utcnow(),
        "emotion": emotion_label,
        "emotion_confidence": emotion_conf,
        "intent": intent_label,
        "intent_confidence": intent_conf,
        "risk": risk
    })

    # =======================
    # EMOTION HISTORY
    # =======================
    db["chat_sessions"].update_one(
        {"session_id": session_id},
        {"$push": {
            "emotion_history": {
                "label": emotion_label,
                "confidence": emotion_conf,
                "timestamp": datetime.utcnow()
            }
        }},
        upsert=True
    )

    # =======================
    # GENERATE RESPONSE
    # =======================
    response = generate_response(
        text=text,
        intent=intent_label,
        emotion=emotion_label,
        intent_conf=intent_conf,
        emotion_conf=emotion_conf,
        threshold=EMOTION_THRESHOLD
    )
    
    response_type = response.get("response_type") or "general"
    response["response_type"] = response_type

    empathetic_text = response.get("empathetic_text", "")
    suggestion_text = response.get("suggestion", "")

    chatbot_text = empathetic_text
    if suggestion_text:
        chatbot_text += f"\n\nSaran awal:\n{suggestion_text}"

    # =======================
    # SAVE BOT MESSAGE
    # =======================
    db["messages"].insert_one({
        "session_id": session_id,
        "isi_pesan": chatbot_text,
        "pengirim": "chatbot",
        "waktu_kirim": datetime.utcnow(),
        "response_type": response_type,
        "emotion": emotion_label,
        "intent": intent_label,
        "risk": risk,
        "raw_response": response
    })

    # =======================
    # RISK NOTIFICATION
    # =======================
    if risk.get("is_critical"):
        db["notifications"].insert_one({
            "type": "immediate_critical",
            "session_id": session_id,
            "details": risk,
            "created_at": datetime.utcnow(),
            "notified": False
        })

    return {
        "emotion": emotion_label,
        "emotion_confidence": emotion_conf,
        "intent": intent_label,
        "intent_confidence": intent_conf,
        "risk": risk,
        "chatbot_text": chatbot_text,
        "response": response,
        "response_type": response_type,
        "meta": {
            "threshold": EMOTION_THRESHOLD,
            "is_low_confidence": response.get("is_low_confidence", False)
        }
    }

