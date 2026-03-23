# backend/app/utils/preprocessing/base_cleaner.py
import re
import emoji

SLANG_MAP = {
    "gk": "gak", "ga": "gak", "ngga": "gak", "nggak": "gak",
    "bgt": "banget", "bgtt": "banget",
    "btw": "by the way",
    "gw": "saya", "gue": "saya",
    "lu": "kamu", "loe": "kamu", "km": "kamu",
    "tp": "tapi", "tpi": "tapi",
    "pls": "tolong",
    "ngntd": "ngentot",
}

EMOJI_MAP = {
    "😡": " marah ",
    "😠": " marah ",
    "😭": " sedih ",
    "😢": " sedih ",
    "😂": " senang ",
    "😍": " cinta ",
    "🥰": " cinta ",
    "😨": " takut ",
}

STOPWORDS = {
    "di", "ke", "dari", "dan", "ini", "itu", "pada", "dengan",
    "sebagai", "karena", "saya", "kamu", "dia", "kami", "kita",
    "ada", "apa", "siapa", "bagaimana", "mengapa", "ya", "oh"
}

SAFE_KEEP = {"tidak", "enggak", "bukan", "banget", "sangat"}
STOPWORDS = STOPWORDS - SAFE_KEEP

def normalize_emoji(text: str):
    for e, rep in EMOJI_MAP.items():
        text = text.replace(e, rep)
    return text

def normalize_slang(text: str):
    words = text.split()
    return " ".join([SLANG_MAP.get(w, w) for w in words])

def normalize_repeated_chars(text: str):
    return re.sub(r"(.)\1{2,}", r"\1", text)

def minimal_clean(text: str):
    text = text.lower()
    text = normalize_emoji(text)
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"#(\w+)", r"\1", text)
    text = re.sub(r"\d+", " ", text)
    text = re.sub(r"[^\w\s!?]", " ", text)
    text = normalize_repeated_chars(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def remove_stopwords(tokens):
    return [t for t in tokens if t not in STOPWORDS]
