# backend/app/nlp/sbert_loader.py
import threading
from sentence_transformers import SentenceTransformer

_model = None
_model_lock = threading.Lock()

def get_sbert_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model

def embed_text(text: str):
    model = get_sbert_model()
    return model.encode([text])[0]
