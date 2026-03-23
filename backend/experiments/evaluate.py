"""
Evaluate emotion classification on the standardized dataset.

This script computes per-class precision/recall/f1 and confusion matrix
by training a simple LogisticRegression on SentenceTransformer embeddings
to provide a reproducible baseline evaluation.

Usage:
  python backend/experiments/evaluate.py

Outputs:
  - backend/model/eval_classification_report.json
  - backend/model/eval_confusion_matrix.npy
"""
import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sentence_transformers import SentenceTransformer

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")
os.makedirs(OUT_DIR, exist_ok=True)

STD_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "EmotionDataset_standardized.csv")
if not os.path.exists(STD_PATH):
    print("Standardized emotion CSV not found. Run experiments/standardize_labels.py first.")
    raise SystemExit(1)

df = pd.read_csv(STD_PATH)
df = df.dropna(subset=["text", "label"]).reset_index(drop=True)

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
texts = df["text"].astype(str).tolist()
labels = df["label"].astype(str).tolist()

print("Computing embeddings...")
emb = model.encode(texts, show_progress_bar=True)

X_train, X_test, y_train, y_test = train_test_split(emb, labels, test_size=0.2, stratify=labels, random_state=42)

clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)

report = classification_report(y_test, y_pred, output_dict=True)
cm = confusion_matrix(y_test, y_pred, labels=sorted(list(set(labels))))

report_path = os.path.join(OUT_DIR, "eval_classification_report.json")
with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

cm_path = os.path.join(OUT_DIR, "eval_confusion_matrix.npy")
np.save(cm_path, cm)

print("Saved classification report to", report_path)
print("Saved confusion matrix to", cm_path)
