#backend/train_tfidf_emotion.py
import os
import pandas as pd
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(BASE_DIR, "data", "EmotionDataset_clean", "EmotionDataset_standardized.csv")
OUT_DIR = os.path.join(BASE_DIR, "model", "tfidf")
os.makedirs(OUT_DIR, exist_ok=True)

VALID_LABELS = {"marah", "cemas", "senang", "sedih"}

def load_dataset():
    df = pd.read_csv(DATA_FILE)
    df = df.dropna(subset=["text", "label"])
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df = df[df["label"].isin(VALID_LABELS)]

    if df.empty:
        raise RuntimeError("Dataset kosong!")

    print(f"Dataset loaded: {len(df)} samples")
    print(f"Label distribution:\n{df['label'].value_counts()}\n")
    return df

def train_tfidf():
    df = load_dataset()
    texts = df["text"].tolist()
    labels = df["label"].tolist()

    # Encode label
    le = LabelEncoder()
    y = le.fit_transform(labels)

    print("Creating TF-IDF vectorizer...")
    tfidf = TfidfVectorizer(
        max_features=600,
        ngram_range=(1, 1),
        min_df=20,
        max_df=0.4,
        lowercase=True
    )

    # Fit ke seluruh data untuk CV
    X_all = tfidf.fit_transform(texts)

    clf = LogisticRegression(
        max_iter=500,
        random_state=42,
        C=1.5
    )

    # =====================================================
    # 5-FOLD CROSS VALIDATION (EVALUASI ILMIAH)
    # =====================================================
    print("\nRunning 5-Fold Cross Validation...")

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    acc_scores = cross_val_score(clf, X_all, y, cv=skf, scoring='accuracy')
    f1_scores = cross_val_score(clf, X_all, y, cv=skf, scoring='f1_macro')

    print("\nCross Validation Results")
    print("Accuracy per fold:", acc_scores)
    print("F1-macro per fold:", f1_scores)
    print(f"Rata-rata Accuracy: {acc_scores.mean():.4f}")
    print(f"Rata-rata F1-macro: {f1_scores.mean():.4f}")

    # =====================================================
    # FINAL TRAIN-TEST SPLIT (UNTUK CONFUSION MATRIX)
    # =====================================================
    X_train_texts, X_test_texts, y_train, y_test = train_test_split(
        texts, y, test_size=0.2, random_state=42, stratify=y
    )

    X_train = tfidf.fit_transform(X_train_texts)
    X_test = tfidf.transform(X_test_texts)

    print(f"\nTF-IDF matrix shape: {X_train.shape}")

    print("\nTraining Logistic Regression classifier...")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    display_labels = [label.capitalize() for label in le.classes_]

    print(f"\n{'='*60}")
    print("TF-IDF FINAL EVALUATION (80/20)")
    print('='*60)
    print(f"Akurasi: {acc:.4f} ({acc*100:.2f}%)")
    print("\nMatriks Kebingungan:")
    print(cm)
    print("\nLaporan Klasifikasi:")
    print(classification_report(y_test, y_pred, target_names=display_labels))

    # =====================================================
    # CONFUSION MATRIX IMAGE
    # =====================================================
    try:
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=display_labels)
        fig, ax = plt.subplots(figsize=(8, 6))
        disp.plot(ax=ax, cmap='Blues', xticks_rotation=45)
        plt.title('Confusion Matrix - TF-IDF')
        plt.tight_layout()

        cm_path = os.path.join(OUT_DIR, 'confusion_matrix.png')
        plt.savefig(cm_path, dpi=150, bbox_inches='tight')
        plt.close(fig)

        print(f"\n Confusion Matrix disimpan ke {cm_path}")
    except Exception as e:
        print(f" Gagal membuat confusion matrix image: {e}")

    # =====================================================
    # SAVE MODEL
    # =====================================================
    joblib.dump(tfidf, os.path.join(OUT_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(clf, os.path.join(OUT_DIR, "tfidf_classifier.pkl"))
    joblib.dump(le, os.path.join(OUT_DIR, "label_encoder_tfidf.pkl"))

    print("\n TF-IDF model trained and saved!")

if __name__ == "__main__":
    train_tfidf()
