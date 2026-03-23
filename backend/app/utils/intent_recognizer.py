# backend/app/utils/intent_recognizer.py
import joblib
import numpy as np
from torch import embedding
from app.nlp.sbert_loader import embed_text
from app.utils.label_map import map_intent
import time

class IntentRecognizer:

    def __init__(self, model_path: str, label_encoder_path: str):
        self.model = joblib.load(model_path)
        self.label_encoder = joblib.load(label_encoder_path)

    def predict_intent(self, text: str):
        embedding = embed_text(text)
        embedding = np.array(embedding).reshape(1, -1)

        label_index = self.model.predict(embedding)[0]
        
        label = self.label_encoder.inverse_transform([label_index])[0]

        if hasattr(self.model, "predict_proba"):
            confidence = float(np.max(self.model.predict_proba(embedding)))
        else:
            confidence = 0.0  

        mapped = map_intent(label)
        t0 = time.time()
        print("Intent time:", round(time.time() - t0, 3), "s")

        return mapped, confidence
