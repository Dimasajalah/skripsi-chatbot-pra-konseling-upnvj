import joblib
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
import os

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model", "emotion")

MODEL_PATH = os.path.join(MODEL_DIR, "emotion_minilm_clf.pkl")
LE_PATH = os.path.join(MODEL_DIR, "emotion_label_encoder.pkl")

def main():
    print("🔄 Load model...")
    clf = joblib.load(MODEL_PATH)
    le = joblib.load(LE_PATH)
    sbert = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    print("\n✅ Model siap. Ketik kalimat (exit untuk keluar)\n")

    while True:
        text = input(" Input text: ").strip()
        if text.lower() in ["exit", "quit"]:
            print("👋 Keluar")
            break

        if len(text) < 3:
            print("⚠ Text terlalu pendek\n")
            continue

        emb = sbert.encode([text])
        emb = normalize(emb)

        pred = clf.predict(emb)[0]
        prob = clf.predict_proba(emb).max()

        label = le.inverse_transform([pred])[0]

        print(f"➡ Emotion: {label} | Confidence: {prob:.2f}\n")

if __name__ == "__main__":
    main()
