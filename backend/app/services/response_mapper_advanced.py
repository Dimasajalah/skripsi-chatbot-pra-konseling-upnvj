# backend/app/services/response_mapper_advanced.py
from app.utils.label_map import map_emotion, map_intent

def generate_response(
    text: str,
    intent: str,
    emotion: str,
    intent_conf: float,
    emotion_conf: float,
    threshold: float = 0.5,
):
    intent = map_intent(intent)
    emotion = map_emotion(emotion)

    if emotion is None or emotion_conf < threshold or intent == "fallback":
        return {
            "response_type": "emotion_confirmation",
            "empathetic_text": (
                "Saya mengerti apa yang sedang kamu rasakan.\n\n"
                "Saya tidak ingin langsung menyimpulkan perasaan kamu.\n"
                "Saat ini, apa yang sebenarnya kamu rasakan?\n\n"
                "Apakah kamu merasa sedih, cemas, marah, "
                "atau ada perasaan lain?"
            ),
            "suggestion": (
                "Ceritakan sedikit tentang perasaanmu. "
                "Setelah itu, jika kamu ingin, saya juga bisa membantu "
                "memberikan saran awal atau mengarahkan ke layanan "
                "konseling offline kampus."
            ),
            "cta": "Saya mengerti apa yang kamu ceritakan. Saat ini, apa yang sedang kamu rasakan?",
            "is_low_confidence": True,
        }

    mapping_rules = {
        ("curhat", "cemas"): "empati",
        ("curhat", "takut"): "empati",
        ("curhat", "sedih"): "empati",
        ("curhat", "marah"): "validasi",
        ("tanya", "netral"): "informatif",
        ("sapaan", "senang"): "friendly",
    }

    category = mapping_rules.get((intent, emotion), "general")

    templates = {
        "empati": (
            f"Saya paham kamu sedang merasa {emotion}. "
            "Situasi seperti ini memang bisa terasa berat, "
            "dan wajar kalau kamu merasa seperti itu."
        ),
        "validasi": (
            f"Perasaan {emotion} yang kamu rasakan itu valid. "
            "Kamu tidak sendirian menghadapinya."
        ),
        "informatif": ("Baik, saya akan mencoba membantu menjawab pertanyaan kamu."),
        "friendly": (
            "Halo! Senang bisa berbincang denganmu. Ada yang bisa saya bantu?"
        ),
        "general": (
            "Saya memahami apa yang kamu ceritakan. "
            "Boleh kamu jelaskan sedikit lagi tentang situasi yang sedang terjadi?"
        ),
    }

    suggestion_map = {
        "sedih": (
            "Mungkin kamu bisa mencoba berbicara dengan teman dekat "
            "atau keluarga yang kamu percaya agar tidak memendamnya sendiri."
        ),
        "cemas": (
            "Kamu bisa mencoba menarik napas perlahan selama beberapa menit "
            "dan fokus pada hal yang bisa kamu kendalikan saat ini."
        ),
        "takut": (
            "Cobalah mengidentifikasi apa yang paling membuatmu takut, "
            "lalu pikirkan langkah kecil yang bisa kamu lakukan."
        ),
        "marah": (
            "Mungkin ada baiknya memberi diri kamu waktu untuk tenang "
            "sebelum mengambil keputusan atau berbicara lebih lanjut."
        ),
    }

    suggestion = None
    if intent == "curhat" and emotion in suggestion_map:
        suggestion = suggestion_map[emotion]

    cta = None

    if intent == "curhat" and emotion in {"sedih", "cemas"}:
        cta = (
            "Apakah kamu ingin saya membantu memikirkan langkah kecil yang bisa kamu lakukan sekarang, "
            "atau jika kamu merasa membutuhkan bantuan lebih lanjut, kamu juga bisa melanjutkan ke sesi konseling."
        )
    elif intent == "curhat" and emotion == "marah":
        cta = (
            "Apakah kamu ingin menceritakan apa yang paling membuatmu marah? "
            "Jika mau, saya juga bisa membantu memberikan saran awal untuk menenangkan diri."
        )

    elif intent == "tanya":
        cta = "Apakah ada detail tambahan yang ingin kamu tanyakan?"

    return {
        "response_type": category,
        "empathetic_text": templates.get(category),
        "suggestion": suggestion,
        "cta": cta,
        "is_low_confidence": False,
    }
