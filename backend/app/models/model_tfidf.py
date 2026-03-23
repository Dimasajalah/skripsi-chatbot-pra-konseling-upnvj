# backend/app/models/model_tfidf.py
import os
import joblib
import numpy as np

class TfidfModel:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join("backend", "model", "tfidf")
        self.vectorizer = joblib.load(os.path.join(model_dir, "tfidf_vectorizer.pkl"))
        self.clf = joblib.load(os.path.join(model_dir, "tfidf_classifier.pkl"))
        self.le = joblib.load(os.path.join(model_dir, "label_encoder_tfidf.pkl"))

    def predict(self, text):
        X = self.vectorizer.transform([text])
        probs = None
        try:
            probs = self.clf.predict_proba(X)[0]
        except Exception:
            preds = self.clf.decision_function(X)
            if preds.ndim == 1:
                probs = self._sigmoid(preds)
            else:
                probs = self._softmax(preds[0])
        idx = int(self.clf.predict(X)[0])
        label = self.le.inverse_transform([idx])[0] if hasattr(self.le, "inverse_transform") else str(idx)
        confidence = float(max(probs)) if probs is not None else 1.0
        return {"label": label, "confidence": confidence, "probs": probs.tolist() if probs is not None else []}

    def _softmax(self, x):
        e = np.exp(x - np.max(x))
        return e / e.sum()

    def _sigmoid(self, x):
        import math
        return 1/(1+math.exp(-x))
