#backend/app/services/response_service.py
from app.utils.label_map import map_intent, map_emotion

# Rule-based response templates
RESPONSE_TEMPLATES = {
    ("curhat", "cemas"): "Saya paham kamu merasa cemas. Bagaimana kalau saya berikan tips belajar?",
    ("curhat", "marah"): "Saya mengerti kamu marah. Mari kita coba cari solusi bersama.",
    ("curhat", "senang"): "Senang mendengar itu! Apa yang membuatmu merasa senang?",
    ("meminta_saran", "cemas"): "Berikut beberapa saran yang mungkin membantu kamu menghadapi situasi ini.",
    ("meminta_saran", "marah"): "Coba lakukan langkah-langkah ini untuk meredakan kemarahanmu...",
    ("meminta_saran", "senang"): "Berikut saran yang bisa kamu lakukan untuk menjaga hal positif ini.",
    ("mencari_informasi", "lainnya"): "Berikut informasi yang kamu cari: ...",
}

def generate_response(raw_intent, raw_emotion, user_text):
    """
    Generate chatbot response based on intent and emotion.
    raw_intent / raw_emotion: label dari classifier
    user_text: input asli (untuk dynamic template filling di masa depan)
    """
    intent = map_intent(raw_intent)
    emotion = map_emotion(raw_emotion)

    key = (intent, emotion)
    template = RESPONSE_TEMPLATES.get(key)

    # fallback jika kombinasi intent-emotion tidak ada
    if not template:
        template = "Maaf, saya belum bisa membantu untuk hal ini."

    response_type = "empathetic" if emotion == "cemas" else "informative"
    
    return {
        "response": template,
        "response_type": response_type,
        "intent": intent,
        "emotion": emotion
    }
