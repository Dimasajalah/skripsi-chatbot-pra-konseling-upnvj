# backend/app/utils/preprocessing/preprocess_minilm.py
from .base_cleaner import minimal_clean, normalize_slang
from app.nlp.sbert_loader import get_sbert_model

def preprocess_for_minilm(text: str) -> str:
    if not text:
        return ""
    text = minimal_clean(text)
    text = normalize_slang(text)
    return text.strip()

class MiniLMEmbedder:
    def __init__(self):
        self.model = get_sbert_model()

    def encode(self, text: str):
        clean_text = preprocess_for_minilm(text)
        return self.model.encode([clean_text])[0]

