# backend/app/utils/response_generator.py
from app.utils.label_map import map_emotion, map_intent

def _ensure_label(x):
    if isinstance(x, dict):
        return x.get("label")
    return x

def generate_response(user_text: str, emotion: str, intent: str):

    raw_emotion = _ensure_label(emotion)
    raw_intent = _ensure_label(intent)

    emotion = map_emotion(raw_emotion)
    intent = map_intent(raw_intent)

    text_lower = (user_text or "").lower()

    intent_emotion_mapping = {
        ("curhat", "cemas"): "empati",
        ("curhat", "sedih"): "empati",
        ("curhat", "marah"): "validasi",
        ("curhat", "senang"): "refleksi",

        ("meminta_saran", "cemas"): "saran",
        ("meminta_saran", "sedih"): "saran",

        ("mencari_informasi", None): "informatif",
        ("tanya", None): "informatif",

        ("sapaan", "senang"): "friendly",
    }

    response_type = intent_emotion_mapping.get((intent, emotion), "general")

    templates = {
        "empati": f"Saya paham kamu sedang merasa {emotion}. "
                  f"Tidak apa-apa merasa seperti ini. Aku di sini untuk mendengarkan.",

        "validasi": f"Perasaan {emotion} yang kamu rasakan itu wajar. "
                    f"Kamu tidak sendirian menghadapi hal ini.",

        "refleksi": f"Senang mendengar kamu merasa {emotion}. "
                    f"Apa yang membuatmu merasa seperti itu?",

        "saran": f"Saya mengerti kamu sedang merasa {emotion}. "
                 f"Mungkin kita bisa cari solusi bersama ya.",

        "informatif": "Baik, saya akan membantu menjawab pertanyaan kamu.",

        "friendly": "Halo! Senang bisa berbincang denganmu, Ada yang ingin kamu ceritakan?",

        "general": "Baik, saya mengerti. Silakan ceritakan lebih lanjut."
    }

    response_text = templates.get(response_type)

    emotion = emotion if emotion in ["senang", "sedih", "marah", "cemas"] else None

    addon = []

    if "ujian" in text_lower:
        addon.append(
            "Jika ini berkaitan dengan ujian, aku bisa bantu memberikan tips belajar."
        )

    if "tugas" in text_lower:
        addon.append(
            "Kalau soal tugas, kita bisa bahas cara mengaturnya agar tidak terlalu berat."
        )

    if "bingung" in text_lower:
        addon.append(
            "Kalau kamu merasa bingung, tidak apa-apa. Kita bahas satu per satu ya."
        )

    if addon:
        response_text = response_text + " " + " ".join(addon)

    if not response_text:
        response_text = "Baik, aku mengerti. Silakan lanjutkan ceritamu."

    return {
    "empathetic_text": response_text,
    "suggestion": (
        "Jika kamu mau, aku bisa membantu memberikan saran awal "
        "atau mengarahkan ke layanan konseling kampus."
    ),
    "cta": "Apakah kamu ingin melanjutkan percakapan?",
    "response_type": response_type
}

