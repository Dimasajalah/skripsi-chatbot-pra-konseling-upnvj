#backend/app/services/classify_service.py
import os
import joblib
import numpy as np
from typing import Optional

from app.utils.preprocessing.preprocess_minilm import preprocess_for_minilm
from app.utils.preprocessing.preprocess_tfidf import preprocess_for_tfidf
from app.utils.preprocessing.preprocess_word2vec import preprocess_for_word2vec
from app.services.ensemble import EnsembleModel
from app.nlp.sbert_loader import embed_text
from app.services.emotion_service import EmotionService

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_EMOTION_DIR = os.path.join(BASE_DIR, "model", "emotion")

emotion_service = EmotionService()

def classify_text(text: str):
    emotion = emotion_service.predict(text)
    return {
        "minilm": emotion
    }

class TfidfVectorizerLoader:
    def __init__(self):
        # placeholder: if you have TF-IDF model file, load here
        self.vec = None

    def predict(self, text: str):
        _ = preprocess_for_tfidf(text)
        return {"label": "netral", "confidence": 0.4}


class Word2VecLoader:
    def __init__(self):
        # placeholder: if you have Word2Vec model file, load here
        self.model = None

    def predict(self, text: str):
        _ = preprocess_for_word2vec(text)
        return {"label": "netral", "confidence": 0.3}

class ClassificationService:
    def __init__(self):
        self.emotion_service = EmotionService()
        self.model_tfidf = TfidfVectorizerLoader()
        self.model_word2vec = Word2VecLoader()

        self.ensemble = None

    def _init_ensemble(self):
        if self.ensemble is None:
            self.ensemble = EnsembleModel([
                self.model_tfidf,
                self.model_word2vec
            ])

    def predict_ensemble(self, text: str):
        emotion = self.emotion_service.predict(text)
        return {
            "emotion": emotion
        }

# === WRAPPER UNTUK ROUTES ===
_service = ClassificationService()


def classify_text(text: str):
    return _service.predict_ensemble(text)
