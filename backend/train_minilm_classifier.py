# backend/train_minilm_classifier.py
import os
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression

DATA_PATH = os.path.join("backend", "model", "minilm", "minilm_data.pkl")
MODEL_DIR = os.path.join("backend", "model", "minilm")

def train_minilm_classifier():
    print("Loading MiniLM embeddings...")
    data = joblib.load(DATA_PATH)

    # OLD FORMAT (tuple)
    # (X_train, y_train, X_test, y_test)
    if isinstance(data, tuple) and len(data) == 4:
        X_train, y_train, X_test, y_test = data
        X = np.vstack([X_train, X_test])
        y = np.hstack([y_train, y_test])
        print("Detected tuple format → merged train+test")
    else:
        raise ValueError("minilm_data.pkl format tidak sesuai. Harap re-train embedding.")

    print(f"Dataset total: {len(X)} samples")

    # Label encoding
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    # Train classifier
    print("Training Logistic Regression classifier...")
    clf = LogisticRegression(
        max_iter=5000,
        solver="lbfgs",
        multi_class="auto"
    )
    clf.fit(X, y_enc)

    # Save classifier + label encoder
    joblib.dump(clf, os.path.join(MODEL_DIR, "minilm_classifier.pkl"))
    joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder_minilm.pkl"))

    print("\n MiniLM classifier training complete!")
    print("Saved to:", MODEL_DIR)


if __name__ == "__main__":
    train_minilm_classifier()
