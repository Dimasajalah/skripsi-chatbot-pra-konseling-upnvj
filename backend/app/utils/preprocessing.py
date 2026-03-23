# backend/app/utils/preprocessing.py
import re

SLANG_MAP = {
    "gak": "tidak", "ga": "tidak","nggak": "tidak","ngga": "tidak",
    "bgt": "banget", "bngt": "banget",
    "km": "kamu", "lu": "kamu", "loe": "kamu",
    "gue": "saya", "gw": "saya",
    "tolol": "bodoh", "goblok": "bodoh", "goblog": "bodoh",
    "anj": "anjing", "anjg": "anjing",
    "btw": "omong-omong",
    "kzl": "kesal",
    "ngntd": "ngentot"
}

EMOJI_MAP = {
    "😡": " marah ", "😠": " marah ",
    "😭": " sedih ", "😢": " sedih ", "😞": " sedih ",
    "😂": " senang ", "😆": " senang ",
    "😍": " cinta ", "🥰": " cinta ",
    "😨": " takut ", "😱": " takut ",
    "❤": " cinta ", "💔": " sedih "
}

def normalize_emoji(text: str):
    for emo, label in EMOJI_MAP.items():
        text = text.replace(emo, label)
    return text

def normalize_slang(text: str):
    words = text.split()
    result = []
    for w in words:
        lw = w.lower()
        if lw in SLANG_MAP:
            result.append(SLANG_MAP[lw])
        else:
            result.append(w)
    return " ".join(result)

def clean_text(text: str):
    text = text.lower()
    text = normalize_emoji(text)

    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)

    text = re.sub(r"[^a-zA-Z\s!?]", " ", text)

    text = re.sub(r"(.)\1{2,}", r"\1", text)

    text = normalize_slang(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def preprocess_text(text: str):
    if not text:
        return ""
    return clean_text(text)
