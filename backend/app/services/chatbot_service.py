# backend/app/services/chatbot_service.py
from datetime import datetime
from urllib import response
from app.services.emotion_service import EmotionService
from app.services.response_mapper_advanced import generate_response
from app.risk_detection import detect_risk
from app.risk_detection import calculate_session_risk

class ChatbotService:
    def __init__(self, *, db, nlp, intent_recognizer):
        self.db = db
        self.nlp = nlp
        self.intent = intent_recognizer
        self.emotion_service = EmotionService()
        self.EMOTION_THRESHOLD = 0.7
        self.INTENT_THRESHOLD = 0.6

    def process_message(self, *, text: str, session_id: str, user: dict):
        previous_messages = list(
            self.db["messages"]
            .find({"session_id": session_id})
            .sort("waktu_kirim", -1)
            .limit(5)
        )
        previous_messages.reverse()
        negative_emotions = {"sedih", "cemas", "marah", "takut"}

        emotion_streak = 0
        for msg in previous_messages:
            if (
                msg.get("pengirim") == "user"
                and msg.get("emotion") in negative_emotions
            ):
                emotion_streak += 1
            else:
                break

        cleaned = self.nlp.preprocess(text)

        emotion = self.emotion_service.predict(cleaned)

        # ===============================
        # EMOTION GUARDRAIL (IMPROVED)
        # ===============================

        NEGATIVE_KEYWORDS = ["sedih", "marah", "cemas", "takut"]
        POSITIVE_KEYWORDS = ["senang", "bahagia", "lega"]

        text_lower = cleaned.lower()

        # ===============================
        # MULTI EMOTION DETECTION FIX
        # ===============================
        detected_keywords = []

        for emo in ["sedih", "marah", "cemas", "takut"]:
            if emo in text_lower:
                detected_keywords.append(emo)

        if len(detected_keywords) > 1:
            # pilih emosi pertama sebagai utama
            detected_emotion = detected_keywords[0]
            emotion["label"] = detected_emotion

        contains_negative = any(k in text_lower for k in NEGATIVE_KEYWORDS)
        contains_positive = any(k in text_lower for k in POSITIVE_KEYWORDS)

        word_count = len(text_lower.split())

        # Jika kalimat terlalu pendek dan tidak ada kata emosi eksplisit → paksa netral
        if word_count <= 5 and not (contains_negative or contains_positive):
            detected_emotion = "netral"

        # Jika ada kata emosi eksplisit → percaya model
        elif contains_negative or contains_positive:
            detected_emotion = emotion["label"]

        # Jika model sangat yakin (≥ 0.9) DAN kalimat cukup panjang → percaya
        elif emotion["confidence"] >= 0.9 and word_count > 3:
            detected_emotion = emotion["label"]

        # Selain itu → netral
        else:
            detected_emotion = "netral"

        if detected_emotion in negative_emotions:
            emotion_streak += 1
        else:
            emotion_streak = 0

        intent_label, intent_conf = self.intent.predict_intent(cleaned)

        # ===============================
        # MULTI-TURN EMOTION FOLLOW-UP FIX
        # ===============================
        if intent_conf is None or intent_conf < self.INTENT_THRESHOLD:
            intent_label = "fallback"
        elif detected_emotion == "netral" and intent_label == "curhat":
            # tetap izinkan curhat walau emosi netral
            pass

        # ===============================
        # FINAL FALLBACK
        # ===============================
        if intent_label is None:
            intent_label = "fallback"
        risk = detect_risk(
            text=text, emotion_label=detected_emotion, intent_label=intent_label
        )
        if risk.get("override_emotion"):
            detected_emotion = risk["override_emotion"]
        # save user message
        self.db["messages"].insert_one(
            {
                "session_id": session_id,
                "isi_pesan": text,
                "pengirim": "user",
                "waktu_kirim": datetime.utcnow(),
                "emotion": detected_emotion,
                "emotion_confidence": emotion["confidence"],
                "intent": intent_label,
                "intent_confidence": intent_conf,
                "risk": risk,
            }
        )

        if detected_emotion is not None:
            self.db["chat_sessions"].update_one(
                {"session_id": session_id},
                {
                    "$push": {
                        "emotion_history": {
                            "label": detected_emotion,
                            "confidence": emotion["confidence"],
                            "text": text,
                            "timestamp": datetime.utcnow(),
                        }
                    }
                },
            )

        response = generate_response(
            text=text,
            intent=intent_label,
            emotion=detected_emotion,
            intent_conf=intent_conf,
            emotion_conf=emotion["confidence"],
            threshold=self.EMOTION_THRESHOLD,
        )
        # ===============================
        # CHECK REQUEST KONSELING
        # ===============================
        counseling_keywords = ["konseling", "psikolog"]

        if any(k in text_lower for k in counseling_keywords):

            chatbot_text = (
                "Baik, jika kamu ingin berbicara langsung dengan psikolog kampus.\n"
                "Kamu dapat melanjutkan ke proses penjadwalan konseling."
            )

            response = {
                "response_type": "redirect_booking",
                "empathetic_text": chatbot_text,
                "suggestion": None,
                "cta": None
            }

            return {
                "session_id": session_id,
                "chatbot_text": chatbot_text,
                "emotion": detected_emotion,
                "emotion_confidence": emotion["confidence"],
                "intent": intent_label,
                "intent_confidence": intent_conf,
                "risk": None,
                "response": response,
                "response_type": "redirect_booking",
                "action": "redirect_booking",   # 🔹 ini yang bikin tombol booking muncul
                "meta": {
                    "threshold": self.EMOTION_THRESHOLD,
                "is_low_confidence": False,
            },
        }

        # ===============================
        # ROLLBACK CTA UNTUK TEKS TANPA EMOSI
        # ===============================
        if detected_emotion == "netral":
            response["cta"] = (
                "Saya mengerti apa yang kamu ceritakan. Saat ini, apa yang sedang kamu rasakan?"
            )

        recent_user_messages = list(
            self.db["messages"]
            .find({"session_id": session_id, "pengirim": "user"})
            .sort("waktu_kirim", -1)
            .limit(3)
        )
        
        # ===============================
        # SESSION RISK LEVEL CHECK
        # ===============================

        emotion_history = [
            m.get("emotion") for m in recent_user_messages if m.get("emotion")
        ]

        session_risk = calculate_session_risk(emotion_history)

        if session_risk["risk_level"] == "Tinggi":
            response["suggestion"] = (
                "Saya melihat dalam beberapa pesan terakhir kamu sering merasa tidak baik. "
                "Mungkin penting untuk mulai mempertimbangkan bantuan profesional."
            )

        elif session_risk["risk_level"] == "Kritikal":
            response["response_type"] = "crisis_support"
            response["suggestion"] = (
                "Dalam percakapan ini terlihat tingkat risiko yang tinggi. "
                "Saya sangat menyarankan kamu segera mencari bantuan profesional."
            )

        negative_count = sum(
            1 for m in recent_user_messages if m.get("emotion") in negative_emotions
        )

        # ===============================
        # LAYERED ESCALATION
        # ===============================
        if negative_count == 2:
            response["suggestion"] = (
                "Saya melihat kamu masih merasa tidak baik. "
                "Apakah ada hal tertentu yang membuat perasaan ini terus muncul?"
            )

        elif negative_count >= 3:
            response["response_type"] = "deep_support"
            response["suggestion"] = (
                "Saya melihat kamu sudah beberapa kali merasa tidak baik. "
                "Ini terlihat cukup berat. Kamu tidak perlu menghadapi ini sendirian. "
                "Jika memungkinkan, pertimbangkan untuk berbicara langsung "
                "dengan konselor kampus."
            )

        # ===============================
        # RISK ESCALATION HANDLING (FIXED & SAFE)
        # ===============================

        risk_level = risk.get("level", "Normal")

        if risk_level == "Kritikal":
            response["response_type"] = "crisis_support"
            response["empathetic_text"] = (
                "Saya sangat khawatir dengan apa yang kamu sampaikan. "
                "Ini terdengar sangat serius dan saya tidak ingin kamu menghadapi ini sendirian."
            )
            response["suggestion"] = (
                "Saya sangat menyarankan kamu segera menghubungi layanan konseling kampus "
                "atau tenaga profesional terdekat. Jika dalam kondisi darurat, "
                "hubungi hotline darurat setempat."
            )
            response["cta"] = None

        elif risk_level == "Tinggi":
            response["suggestion"] = (
                "Apa yang kamu sampaikan terdengar cukup berat. "
                "Mungkin ini saat yang tepat untuk mempertimbangkan berbicara "
                "dengan konselor kampus atau orang yang kamu percaya."
            )

        elif risk_level == "Waspada":
            if not response.get("suggestion"):
                response["suggestion"] = (
                    "Perasaan seperti ini penting untuk diperhatikan. "
                    "Cobalah beri waktu untuk memahami apa yang kamu rasakan."
                )

        chatbot_text = response.get("empathetic_text", "")
        if response.get("suggestion"):
            chatbot_text += f"\n\nSaran awal:\n{response['suggestion']}"

        self.db["messages"].insert_one(
            {
                "session_id": session_id,
                "isi_pesan": chatbot_text,
                "pengirim": "chatbot",
                "waktu_kirim": datetime.utcnow(),
                "response_type": response.get("response_type"),
                "emotion": detected_emotion,
                "intent": intent_label,
            }
        )

        last_bot_message = next(
            (m for m in previous_messages if m.get("pengirim") == "chatbot"), None
        )

        if last_bot_message and last_bot_message.get("response_type") == response.get(
            "response_type"
        ):
            response["cta"] = None

        recent_high_risk = sum(
            1 for m in previous_messages if m.get("risk", {}).get("level") == "Kritikal"
        )

        if recent_high_risk >= 2 and risk["level"] != "Kritikal":
            response["suggestion"] = (
                "Saya sangat khawatir dengan kondisi kamu. "
                "Ini terlihat serius dan saya sangat menyarankan "
                "kamu segera mencari bantuan profesional."
            )

        return {
            "session_id": session_id,
            "chatbot_text": chatbot_text,
            "emotion": detected_emotion,
            "emotion_confidence": emotion["confidence"],
            "intent": intent_label,
            "intent_confidence": intent_conf,
            "risk": risk,
            "response": response,
            "response_type": response.get("response_type"),
            "meta": {
                "threshold": self.EMOTION_THRESHOLD,
                "is_low_confidence": response.get("is_low_confidence", False),
            },
        }
