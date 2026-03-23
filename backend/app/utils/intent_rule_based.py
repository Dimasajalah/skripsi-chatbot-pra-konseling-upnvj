# backend/app/utils/intent_rule_based.py
def detect_intent(text: str):
    text = text.lower()

    if any(k in text for k in [
        "bagaimana", "gimana", "cara", "tips", "supaya", "agar"
    ]):
        return {
            "label": "meminta_saran",
            "confidence": 0.9
        }

    if any(k in text for k in [
        "curhat", "capek", "stres", "bingung", "lelah",
        "saya merasa", "aku merasa"
    ]):
        return {
            "label": "curhat",
            "confidence": 0.85
        }

    if any(k in text for k in [
        "jadwal", "prosedur", "apa itu", "daftar", "biaya"
    ]):
        return {
            "label": "mencari_informasi",
            "confidence": 0.85
        }

    return {
        "label": None,
        "confidence": 0.0
    }
