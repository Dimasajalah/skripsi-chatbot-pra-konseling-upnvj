#backend/app/services/emotion_service.py
import joblib
import os
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
from app.db import get_emotion_results_collection
from datetime import datetime
from app.nlp.sbert_loader import embed_text
import time

class EmotionService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_dir = os.path.join(base_dir, "model", "emotion")

        self.clf = joblib.load(os.path.join(model_dir, "emotion_minilm_clf.pkl"))
        self.le = joblib.load(os.path.join(model_dir, "emotion_label_encoder.pkl"))

    def predict(self, text: str) -> dict:
        if not text or len(text.strip()) < 3:
            return {
                "label": "lainnya",
                "confidence": 0.0
            }

        t0 = time.time()
        emb = embed_text(text).reshape(1, -1)
        emb = normalize(emb)
        print("Embedding time:", round(time.time() - t0, 3), "s")

        t1 = time.time()
        probs = self.clf.predict_proba(emb)[0]
        print("Classifier time:", round(time.time() - t1, 3), "s")

        pred_idx = probs.argmax()
        label = self.le.inverse_transform([pred_idx])[0]
        confidence = float(probs[pred_idx])

        confidence = min(confidence, 0.92)

        if confidence < 0.55:
            return {
                "label": "netral",
                "confidence": round(confidence, 3),
                "is_low_confidence": True
            }

        return {
            "label": label,
            "confidence": round(confidence, 3),
            "is_low_confidence": False
        }
        
    def save_emotion_result(self, *args, **kwargs):
        raise RuntimeError(
            "EmotionResult TIDAK BOLEH dibuat manual. "
            "Gunakan /chatbot/end-session sebagai satu-satunya source resmi."
    )

    def get_emotion_results_by_mahasiswa(self, mahasiswa_id: str):
        collection = get_emotion_results_collection()
        results = list(collection.find({"mahasiswa_id": mahasiswa_id}).sort("created_at", -1))
        for r in results:
            r["emotion_id"] = str(r["_id"])
            r["label_emosi"] = r.get("label_emosi")
            r["tingkat_kepercayaan"] = r.get("tingkat_kepercayaan")
            del r["_id"]
        return results
    
    def get_emotion_result_by_session(self, session_id: str):
        from app.db import get_emotion_results_collection
        collection = get_emotion_results_collection()
        res = collection.find_one({"session_id": session_id})
        if not res:
            return None
        res["emotion_id"] = str(res["_id"])
        del res["_id"]
        return res



