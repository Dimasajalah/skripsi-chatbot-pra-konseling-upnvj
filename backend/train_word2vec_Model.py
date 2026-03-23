# backend/train_word2vec_model.py
import os
import glob
import sys
from pathlib import Path
import pandas as pd
import joblib
from gensim.models import Word2Vec
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import f1_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Ensure project root is on sys.path so `backend.app` imports resolve when
# running this script directly.
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.app.utils.preprocessing.preprocess_word2vec import preprocess_for_word2vec
import numpy as np

DATA_DIR = str(ROOT.joinpath("backend", "data", "EmotionDataset"))
OUT_DIR = str(ROOT.joinpath("backend", "model", "word2vec"))
os.makedirs(OUT_DIR, exist_ok=True)

def load_emotion_dataset(data_dir=DATA_DIR):
    frames = []
    files = sorted(glob.glob(os.path.join(data_dir, "*Data.csv")))
    for f in files:
        parsed = []
        try:
            with open(f, 'r', encoding='utf-8', errors='replace') as fh:
                for i, line in enumerate(fh):
                    line = line.rstrip('\n')
                    if i == 0 and ('Tweet' in line and 'Label' in line):
                        continue
                    if not line.strip():
                        continue
                    # Prefer splitting on the last tab; fallback to last comma.
                    if '\t' in line:
                        text, label = line.rsplit('\t', 1)
                    elif ',' in line:
                        text, label = line.rsplit(',', 1)
                    else:
                        # Can't split — skip this line.
                        continue
                    parsed.append((text.strip(), label.strip()))
        except Exception as e:
            print(f"Error reading file {f}: {e}")
            continue

        if not parsed:
            print(f"No parsed rows for {f}; skipping")
            continue

        df = pd.DataFrame(parsed, columns=["text", "label"])
        frames.append(df)
    if not frames:
        raise RuntimeError(f"No datasets could be loaded from {data_dir!r}. Files checked: {files}")
    return pd.concat(frames, ignore_index=True)

def texts_to_tokens(series):
    return series.astype(str).apply(preprocess_for_word2vec).tolist()

def doc_to_vec(tokens, w2v, size):
    if not tokens:
        return np.zeros(size, dtype=float)
    vecs = []
    for t in tokens:
        if t in w2v.wv:
            vecs.append(w2v.wv[t])
    if not vecs:
        return np.zeros(size, dtype=float)
    return np.mean(vecs, axis=0)

def train_word2vec():
    df = load_emotion_dataset()
    df = df.dropna(subset=["text", "label"])
    tokens_list = texts_to_tokens(df["text"])
    le = LabelEncoder()
    y = le.fit_transform(df["label"].astype(str))

    # =====================================================
    # 5-FOLD CROSS VALIDATION
    # =====================================================
    print("\nRunning 5-Fold Cross Validation...")

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    acc_scores = []
    f1_scores = []

    for fold, (train_idx, test_idx) in enumerate(skf.split(tokens_list, y), 1):
        X_train_toks = [tokens_list[i] for i in train_idx]
        X_test_toks = [tokens_list[i] for i in test_idx]
        y_train = y[train_idx]
        y_test = y[test_idx]

        w2v = Word2Vec(
            sentences=X_train_toks,
            vector_size=100,
            window=5,
            min_count=2,
            workers=4,
            sg=1,
            epochs=10
        )

        size = w2v.vector_size

        X_train_vec = np.array([doc_to_vec(toks, w2v, size) for toks in X_train_toks])
        X_test_vec = np.array([doc_to_vec(toks, w2v, size) for toks in X_test_toks])

        clf = LogisticRegression(max_iter=300)
        clf.fit(X_train_vec, y_train)

        y_pred = clf.predict(X_test_vec)

        acc_scores.append(accuracy_score(y_test, y_pred))
        f1_scores.append(f1_score(y_test, y_pred, average="macro"))

        print(f"Fold {fold} Accuracy: {acc_scores[-1]:.4f}")
        print(f"Fold {fold} F1-macro: {f1_scores[-1]:.4f}\n")

    print("Cross Validation Results")
    print("Accuracy per fold:", acc_scores)
    print("F1-macro per fold:", f1_scores)
    print(f"Rata-rata Accuracy: {np.mean(acc_scores):.4f}")
    print(f"Rata-rata F1-macro: {np.mean(f1_scores):.4f}")

    # =====================================================
    # FINAL 80/20 SPLIT (UNTUK CONFUSION MATRIX)
    # =====================================================
    X_train_toks, X_test_toks, y_train, y_test = train_test_split(
        tokens_list, y, test_size=0.2, stratify=y, random_state=42
    )

    w2v = Word2Vec(
        sentences=X_train_toks,
        vector_size=100,
        window=5,
        min_count=2,
        workers=4,
        sg=1,
        epochs=10
    )

    size = w2v.vector_size

    X_train_vec = np.array([doc_to_vec(toks, w2v, size) for toks in X_train_toks])
    X_test_vec = np.array([doc_to_vec(toks, w2v, size) for toks in X_test_toks])

    clf = LogisticRegression(max_iter=300)
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)

    # Map emotion labels to Indonesian
    label_map = {
        'Anger': 'Marah',
        'Fear': 'Cemas',
        'Joy': 'Senang',
        'Sad': 'Sedih'
    }
    display_labels = [label_map.get(c, c) for c in le.classes_]

    print("\n============================================================")
    print("WORD2VEC FINAL EVALUATION (80/20)")
    print("============================================================")

    print(classification_report(y_test, y_pred, target_names=display_labels))

    acc = accuracy_score(y_test, y_pred)
    report_dict = classification_report(
        y_test, y_pred,
        target_names=display_labels,
        output_dict=True
    )

    f1_macro = report_dict["macro avg"]["f1-score"]

    print(f"Akurasi: {acc:.4f} ({acc*100:.2f}%)")
    print(f"F1-Macro: {f1_macro:.4f}")

    # Confusion matrix plot
    try:
        cm = confusion_matrix(y_test, y_pred)
        print("\nMatriks Kebingungan:")
        print(cm)

        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=display_labels)
        fig, ax = plt.subplots(figsize=(8, 6))
        disp.plot(ax=ax, cmap='Blues', xticks_rotation=45)
        plt.title('Confusion Matrix Word2Vec')
        plt.tight_layout()

        cm_path = os.path.join(OUT_DIR, 'confusion_matrix.png')
        plt.savefig(cm_path, dpi=150, bbox_inches='tight')
        plt.close(fig)

        print('Confusion Matrix disimpan ke', cm_path)

    except Exception as e:
        print('Gagal membuat gambar Confusion Matrix:', e)

    # SAVE MODEL
    w2v.save(os.path.join(OUT_DIR, "word2vec.model"))
    joblib.dump(clf, os.path.join(OUT_DIR, "word2vec_classifier.pkl"))
    joblib.dump(le, os.path.join(OUT_DIR, "label_encoder_w2v.pkl"))

    print("Saved Word2Vec artifacts to", OUT_DIR)

if __name__ == "__main__":
    train_word2vec()
