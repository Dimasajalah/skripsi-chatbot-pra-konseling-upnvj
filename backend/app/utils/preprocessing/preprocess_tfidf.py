#backend/app/utils/preprocessing/preprocess_tfidf.py
import os
import pickle
from pathlib import Path
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from .base_cleaner import minimal_clean, normalize_slang, remove_stopwords

USE_STEM = os.getenv("USE_STEMMING", "false").lower() in ("1", "true")
stemmer = StemmerFactory().create_stemmer() if USE_STEM else None

def preprocess_for_tfidf(text: str) -> str:
    if not text:
        return ""

    text = minimal_clean(text)
    text = normalize_slang(text)

    tokens = text.split()
    tokens = remove_stopwords(tokens)

    if USE_STEM and stemmer:
        tokens = [stemmer.stem(t) for t in tokens]

    return " ".join(tokens)

class TfidfVectorizerLoader:
    def __init__(self, model_path: str = "model/tfidf/tfidf_vectorizer.pkl"):
        self.model_path = Path(model_path)
        self.vectorizer = None
        self._load()

    def _load(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"TF-IDF vectorizer not found at {self.model_path.resolve()}"
            )
        with open(self.model_path, "rb") as f:
            self.vectorizer = pickle.load(f)

    def transform(self, text: str):
        clean_text = preprocess_for_tfidf(text)
        return self.vectorizer.transform([clean_text])
