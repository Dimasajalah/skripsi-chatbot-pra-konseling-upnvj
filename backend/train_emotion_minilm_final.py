# backend/train_emotion_minilm_final.py
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import LabelEncoder, normalize
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.metrics import ConfusionMatrixDisplay
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
from sentence_transformers import SentenceTransformer
import random

BASE_DIR = os.path.dirname(__file__)
DATA_FILE = os.path.join(
    BASE_DIR, "data", "EmotionDataset_clean", "EmotionDataset_standardized.csv"
)
OUT_DIR = os.path.join(BASE_DIR, "model", "emotion")
os.makedirs(OUT_DIR, exist_ok=True)

VALID_LABELS = {"marah", "cemas", "senang", "sedih"}

# ----------------------------
# Text Augmentation Functions
# ----------------------------
def synonym_replace(text, n=1):
    # placeholder sederhana: bisa diganti dengan library nlp augmentasi
    # contohnya: gunakan nltk WordNet atau backtranslation
    words = text.split()
    if len(words) < 2:
        return text
    for _ in range(n):
        idx = random.randint(0, len(words)-1)
        words[idx] = words[idx]  # untuk saat ini tetap kata asli
    return " ".join(words)

def augment_texts(texts, labels):
    augmented_texts, augmented_labels = [], []
    for text, label in zip(texts, labels):
        augmented_texts.append(text)
        augmented_labels.append(label)
        # augment minor class
        if label in ["cemas", "sedih"]:  # contoh minor class
            augmented_texts.append(synonym_replace(text))
            augmented_labels.append(label)
    return augmented_texts, augmented_labels

def load_dataset():
    df = pd.read_csv(DATA_FILE)
    df = df.dropna(subset=["text", "label"])
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df = df[df["label"].isin(VALID_LABELS)]
    if df.empty:
        raise RuntimeError("Dataset kosong setelah filter label valid!")
    print("Distribusi label awal:")
    print(df["label"].value_counts())
    return df

def train():
    df = load_dataset()
    texts, labels = df["text"].tolist(), df["label"].tolist()
   
    texts, labels = augment_texts(texts, labels)
    print(f"Jumlah data setelah augmentasi: {len(texts)}")
   
    le = LabelEncoder()
    y = le.fit_transform(labels)
   
    print("Load MiniLM model...")
    sbert = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
   
    print("Embedding texts...")
    X = sbert.encode(texts, show_progress_bar=True)
    X = normalize(X)

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold = 1
    accs, f1s = [], []
   
    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
       
        clf = MLPClassifier(
            hidden_layer_sizes=(128,),
            activation='relu',
            solver='adam',
            alpha=0.001,
            learning_rate='adaptive',
            max_iter=700,
            validation_fraction=0.15,
            n_iter_no_change=15,
            early_stopping=True,
            random_state=42
        )
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_val)

        # 🔥 TAMBAHKAN INI
        print("\nClassification Report Fold", fold)
        print(classification_report(y_val, y_pred, target_names=le.classes_))
        cm = confusion_matrix(y_val, y_pred, labels=range(len(le.classes_)))
        display_labels = le.classes_

        try:
            disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=display_labels)
            fig, ax = plt.subplots(figsize=(8, 6))
            disp.plot(ax=ax, cmap='Blues', xticks_rotation=45)
            plt.title(f'Confusion Matrix - Fold {fold} (MiniLM)')
            plt.tight_layout()

            cm_path = os.path.join(OUT_DIR, f'confusion_matrix_fold_{fold}.png')
            plt.savefig(cm_path, dpi=150, bbox_inches='tight')
            plt.close(fig)

            print(f"\n Confusion Matrix disimpan ke {cm_path}")
        except Exception as e:
            print(f" Gagal membuat confusion matrix image: {e}")

        acc = accuracy_score(y_val, y_pred)
        f1 = classification_report(y_val, y_pred, target_names=le.classes_, output_dict=True)["macro avg"]["f1-score"]
        print(f"Fold {fold} → Accuracy: {acc*100:.2f}%, F1-macro: {f1*100:.2f}%")
        fold += 1
        accs.append(acc)
        f1s.append(f1)
   
    print(f"\nRata-rata Accuracy: {np.mean(accs)*100:.2f}%")
    print(f"Rata-rata F1-macro: {np.mean(f1s)*100:.2f}%")

    # Train final model on all data
    final_clf = MLPClassifier(
        hidden_layer_sizes=(128, 64),
        activation='relu',
        solver='adam',
        max_iter=500,
        early_stopping=True,
        verbose=True,
        random_state=42
    )
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    final_clf.fit(X_train, y_train)
    y_final_pred = final_clf.predict(X_test)
    
    print("\nFINAL CLASSIFICATION REPORT (MiniLM)")
    print(classification_report(y_test, y_final_pred, target_names=le.classes_))
   
    final_acc = accuracy_score(y_test, y_final_pred)
    final_f1 = classification_report(
        y_test, y_final_pred,
        target_names=le.classes_,
        output_dict=True
    )["macro avg"]["f1-score"]

    print(f"\n Final Training Accuracy: {final_acc*100:.2f}%")
    print(f" Final Training F1-Macro: {final_f1*100:.2f}%")

    # Hitung confusion matrix
    cm = confusion_matrix(y_test, y_final_pred, labels=range(len(le.classes_)))
    display_labels = le.classes_

    try:
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=display_labels)
        fig, ax = plt.subplots(figsize=(8, 6))
        disp.plot(ax=ax, cmap='Blues', xticks_rotation=45)
        plt.title('Confusion Matrix - Final Model (MiniLM)')
        plt.tight_layout()

        cm_path = os.path.join(OUT_DIR, 'confusion_matrix_final.png')
        plt.savefig(cm_path, dpi=150, bbox_inches='tight')
        plt.close(fig)

        print(f"\n Final Confusion Matrix disimpan ke {cm_path}")
    except Exception as e:
        print(f" Gagal membuat confusion matrix image: {e}")
   
    joblib.dump(final_clf, os.path.join(OUT_DIR, "emotion_minilm_clf.pkl"))
    joblib.dump(le, os.path.join(OUT_DIR, "emotion_label_encoder.pkl"))
    print(f"\n Model dan LabelEncoder disimpan di: {OUT_DIR}")

if __name__ == "__main__":
    train()


