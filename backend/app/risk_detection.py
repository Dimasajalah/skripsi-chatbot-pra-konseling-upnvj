# backend/app/risk_detection.py
from typing import List, Dict
from app.utils.label_map import map_emotion

HIGH_RISK_KEYWORDS = [
    "bunuh diri",
    "bunuhdiri",
    "bunuh",
    "mau mati",
    "ingin mati",
    "mengakhiri hidup",
    "mengakhiri semuanya",
    "tidak ingin hidup",
    "hidup tidak ada gunanya",
    "ingin bunuh diri",
    "ingin mengakhiri",
    "suicide",
    "kill myself",
    "kill me",
    "ingin menghilang",
    "ingin menyerah",
    "menyerah saja",
    "lebih baik mati",
    "capek hidup",
]

MEDIUM_RISK_KEYWORDS = [
    "menyakiti diri",
    "menyakiti",
    "sakit hati",
    "benci hidup",
    "berhenti hidup",
    "ingin hilang",
    "hilang saja",
    "mau pergi saja",
]

# HIGH RISK KEYWORDS
HIGH_RISK_KEYWORDS += [
    "menyerah total",
    "tidak mau hidup lagi",
    "mati saja",
    "tidak ada harapan",
    "tak tahan",
    "tidak kuat lagi",
    "tidak tahan lagi hidup",
    "tidak tahan hidup",
    "hidup seperti ini",
    "tidak kuat menjalani hidup",
    "sudah tidak kuat",
    "lelah hidup",
    "ingin mengakhiri hidup",
]

MEDIUM_RISK_KEYWORDS += ["sangat kecewa", "sangat frustasi"]

def _contains_any(text: str, keywords: List[str]) -> List[str]:
    text_l = (text or "").lower()
    found = [k for k in keywords if k in text_l]
    return found

def detect_risk(text: str, emotion_label: str = None, intent_label: str = None) -> Dict:
    matches = []
    text_lower = (text or "").lower()

    high = _contains_any(text_lower, HIGH_RISK_KEYWORDS)
    if high:
        matches.extend(high)
        return {
            "is_critical": True,
            "level": "Kritikal",
            "matches": matches,
            "override_emotion": "sedih",
        }

    medium = _contains_any(text_lower, MEDIUM_RISK_KEYWORDS)
    if medium:
        matches.extend(medium)
        mapped_emotion = map_emotion(emotion_label)

        if mapped_emotion in {"cemas", "sedih", "marah"}:
            return {
                "is_critical": False,
                "level": "Tinggi",
                "matches": matches,
            }

        return {
            "is_critical": False,
            "level": "Waspada",
            "matches": matches,
        }

    mapped_emotion = map_emotion(emotion_label)

    if mapped_emotion in {"sedih", "marah"} and intent_label == "curhat":
        return {
            "is_critical": False,
            "level": "Waspada",
            "matches": [],
        }

    if mapped_emotion == "sedih" and "gagal" in text_lower:
        return {
            "is_critical": False,
            "level": "Tinggi",
            "matches": ["gagal"],
        }

    return {
        "is_critical": False,
        "level": "Normal",
        "matches": [],
    }

NEGATIVE_EMOTIONS = {"sedih", "marah", "cemas", "takut"}
RISK_LEVELS = ["Normal", "Waspada", "Tinggi", "Kritikal"]

def calculate_session_risk(emotion_list: List[str]) -> Dict:
    n_total = len(emotion_list)
    if n_total == 0:
        return {
            "risk_level": "Normal",
            "percentage_negative": 0.0,
            "max_consecutive_negative": 0,
            "recommendation": "",
            "high_risk_keyword_count": 0,
            "medium_risk_keyword_count": 0,
        }

    n_neg = sum(1 for e in emotion_list if e in NEGATIVE_EMOTIONS)
    p_neg = (n_neg / n_total) * 100

    max_consecutive = 0
    current_streak = 0
    for emotion in emotion_list:
        if emotion in NEGATIVE_EMOTIONS:
            current_streak += 1
            max_consecutive = max(max_consecutive, current_streak)
        else:
            current_streak = 0

    if p_neg < 40:
        risk_index = 0
    elif 40 <= p_neg < 60:
        risk_index = 1
    elif 60 <= p_neg < 80:
        risk_index = 2
    else:
        if max_consecutive >= 4:
            risk_index = 3
        else:
            risk_index = 2

    return {
        "risk_level": RISK_LEVELS[risk_index],
        "percentage_negative": round(p_neg, 2),
        "max_consecutive_negative": max_consecutive,
        "recommendation": (
            "Terdeteksi tingkat risiko KRITIKAL. Segera dijadwalkan konseling lanjutan."
            if risk_index == 3
            else ""
        ),
    }
