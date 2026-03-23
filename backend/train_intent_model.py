# backend/train_intent_model.py
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sentence_transformers import SentenceTransformer
from app.utils.preprocessing import preprocess_text

BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "intent_dataset.csv")
OUT_DIR = os.path.join(BASE, "model", "intent")
os.makedirs(OUT_DIR, exist_ok=True)

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
sbert = SentenceTransformer(MODEL_NAME)

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["text","intent"]).reset_index(drop=True)

df["clean"] = df["text"].apply(preprocess_text)

train, test = train_test_split(df, test_size=0.15, stratify=df["intent"], random_state=42)

print("Embedding train...")
X_train_emb = sbert.encode(train["clean"].tolist(), show_progress_bar=True)
print("Embedding test...")
X_test_emb = sbert.encode(test["clean"].tolist(), show_progress_bar=True)

le = LabelEncoder()
y_train = le.fit_transform(train["intent"])
y_test = le.transform(test["intent"])

clf = LogisticRegression(max_iter=2000, class_weight="balanced", n_jobs=-1)
print("Training classifier...")
clf.fit(X_train_emb, y_train)

y_pred = clf.predict(X_test_emb)
print("Classification report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

joblib.dump(clf, os.path.join(OUT_DIR, "intent_clf_sbert512.pkl"))
joblib.dump(le, os.path.join(OUT_DIR, "intent_label_encoder_sbert512.pkl"))
print("Saved intent model and label encoder to", OUT_DIR)
