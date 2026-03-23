#backend/train_minilm_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer
import pickle, os
import numpy as np
import csv
from sklearn.preprocessing import LabelEncoder
import joblib

from app.utils.label_map import map_emotion

DATA_DIR = "backend/data/EmotionDataset"

FILES = [
    f"{DATA_DIR}/AngerData.csv",
    f"{DATA_DIR}/FearData.csv",
    f"{DATA_DIR}/JoyData.csv",
    f"{DATA_DIR}/SadData.csv",
]

def load_and_clean():
    df_list = []
    for file in FILES:
        print("Loading:", file)

        d = pd.read_csv(
            file,
            sep=None,                    # AUTODETECT separator (comma/tab)
            engine="python",            
            header=None,
            names=["text", "label"],
            dtype=str,
            quoting=csv.QUOTE_NONE,      # <-- IGNORE BROKEN QUOTES
            on_bad_lines="skip",         # <-- skip baris yang rusak
            encoding="utf-8",
        )

        d = d.dropna(subset=["text", "label"])
        d["text"] = d["text"].astype(str).str.strip()
        d["label"] = d["label"].astype(str).str.strip().str.lower()

        df_list.append(d)

    df = pd.concat(df_list, ignore_index=True)
    print("Unique labels:", df.label.unique())
    print("Jumlah total data:", len(df))

    return df

def train():
    df = load_and_clean()

    X = df["text"].tolist()
    # map labels to canonical emotions
    y = df["label"].astype(str).str.lower().apply(map_emotion).tolist()

    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    embeddings = model.encode(X, show_progress_bar=True)

    X_train, X_test, y_train, y_test = train_test_split(
        embeddings,
        y,
        test_size=0.2,
        stratify=y,
        random_state=42
    )

    os.makedirs("backend/model/minilm", exist_ok=True)
    pickle.dump((X_train, y_train, X_test, y_test),
                open("backend/model/minilm/minilm_data.pkl", "wb"))

    # save a LabelEncoder fitted on mapped labels for downstream training
    le = LabelEncoder()
    le.fit(y)
    os.makedirs("backend/model", exist_ok=True)
    joblib.dump(le, "backend/model/label_encoder_emotion_from_train.pkl")

    print("\n✔ TRAINING DATA MINI LM DISIMPAN")
    print("✔ LabelEncoder saved to backend/model/label_encoder_emotion_from_train.pkl")

if __name__ == "__main__":
    train()
