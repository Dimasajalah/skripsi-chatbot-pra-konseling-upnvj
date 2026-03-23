# backend/app/models/model_word2vec.py
import os
import joblib
import numpy as np
from gensim.models import Word2Vec

class Word2VecModel:
    def __init__(self, model_dir=None):
        if model_dir is None:
            model_dir = os.path.join("backend", "model", "word2vec")
        self.w2v = Word2Vec.load(os.path.join(model_dir, "word2vec.model"))
        self.clf = joblib.load(os.path.join(model_dir, "word2vec_classifier.pkl"))
        self.le = joblib.load(os.path.join(model_dir, "label_encoder_w2v.pkl"))
        self.size = self.w2v.vector_size

    def _doc_vec(self, tokens):
        vecs = [self.w2v.wv[t] for t in tokens if t in self.w2v.wv]
        if not vecs:
            return np.zeros(self.size, dtype=float)
        return np.mean(vecs, axis=0)

    def predict(self, tokens):
        if isinstance(tokens, str):
            toks = tokens.split()
        else:
            toks = tokens
        v = self._doc_vec(toks).reshape(1, -1)
        try:
            probs = self.clf.predict_proba(v)[0]
        except Exception:
            probs = []
        pred = int(self.clf.predict(v)[0])
        label = self.le.inverse_transform([pred])[0] if hasattr(self.le, "inverse_transform") else str(pred)
        confidence = float(max(probs)) if len(probs)>0 else 1.0
        return {"label": label, "confidence": confidence, "probs": probs.tolist() if len(probs)>0 else []}
