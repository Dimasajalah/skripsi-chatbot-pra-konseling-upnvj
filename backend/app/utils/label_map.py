#backend/app/utils/label_map.py
from typing import Optional

TARGET_EMOTIONS = {"senang", "sedih", "marah", "cemas"}

# Mapping of various possible labels (from models or heuristics) to the
# canonical target emotions used in the research.
EMOTION_MAP = {
    # happiness/joy
    "senang": "senang",
    "bahagia": "senang",
    "gembira": "senang",
    "joy": "senang",
    "cinta": "senang",
    "friendly": "senang",
    "netral": "lainnya",

    # common english labels
    "anger": "marah",
    "joy": "senang",

    # sadness
    "sedih": "sedih",
    "sad": "sedih",
    "cry": "sedih",

    # anger
    "marah": "marah",
    "kesal": "marah",
    "angry": "marah",

    # anxiety/fear
    "cemas": "cemas",
    "takut": "cemas",
    "fear": "cemas",
}

INTENT_MAP = {
    "curhat": "curhat",
    "curhat_user": "curhat",
    "meminta_saran": "meminta_saran",
    "minta_saran": "meminta_saran",
    "tanya": "mencari_informasi",
    "mencari_informasi": "mencari_informasi",
    "sapaan": "sapaan",
    "lainnya": "lainnya",
}

def map_emotion(label: Optional[str]) -> str:
    if not label:
        return "lainnya"
    l = str(label).lower()
    return EMOTION_MAP.get(l, "lainnya")


def map_intent(label: Optional[str]) -> str:
    if not label:
        return "lainnya"
    l = str(label).lower()
    return INTENT_MAP.get(l, "lainnya")
