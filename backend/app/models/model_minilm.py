# backend/app/models/model_minilm.py
import pickle
import joblib
import numpy as np
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from app.nlp.sbert_loader import get_sbert_model  

BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_DIR = BASE_DIR / "backend" / "model" / "minilm"

CLASSIFIER_PATH = MODEL_DIR / "minilm_classifier.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder_minilm.pkl"

_sbert_model = None
_classifier = None
_label_encoder = None

def load_minilm_pipeline():
    global _sbert_model, _classifier, _label_encoder

    if _sbert_model is None:
        # use the SentenceTransformer loader from app.nlp.sbert_loader
        _sbert_model = get_sbert_model()

    if _classifier is None:
        # classifier was saved with joblib; use joblib.load to ensure compatibility
        _classifier = joblib.load(CLASSIFIER_PATH)

    if _label_encoder is None:
        _label_encoder = joblib.load(LABEL_ENCODER_PATH)

    return _sbert_model, _classifier, _label_encoder

def predict_emotion_minilm(text: str):
    sbert, clf, label_encoder = load_minilm_pipeline()

    embedding = sbert.encode([text])
    embedding = np.array(embedding)

    probs = clf.predict_proba(embedding)[0]
    pred_idx = int(np.argmax(probs))

    label = label_encoder.inverse_transform([pred_idx])[0]
    confidence = float(probs[pred_idx])

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "probabilities": {
            label_encoder.inverse_transform([i])[0]: round(float(p), 4)
            for i, p in enumerate(probs)
        }
    }
