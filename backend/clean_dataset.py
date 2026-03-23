# backend/clean_dataset.py
import os
import re
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder

DATA_DIR = "backend/data/EmotionDataset_cleaned"
OUT_DIR = "backend/data"
MODEL_DIR = "backend/model"

os.makedirs(MODEL_DIR, exist_ok=True)

def map_emotion(label: str) -> str:
    if not isinstance(label, str):
        return "unknown"
    label_clean = label.lower().strip()

    # Mapping berdasarkan substring yang fleksibel
    if any(k in label_clean for k in ["anger", "marah", "marahh"]):
        return "marah"
    elif any(k in label_clean for k in ["fear", "takut", "cemas", "cemass"]):
        return "cemas"
    elif any(k in label_clean for k in ["joy", "happy", "senang", "seneng"]):
        return "senang"
    elif any(k in label_clean for k in ["sad", "sedih", "sedihh"]):
        return "sedih"
    else:
        return "unknown"

# Ambil semua CSV di folder
all_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]

# Debug: tampilkan semua label unik
all_labels = set()
for file_name in all_files:
    df = pd.read_csv(os.path.join(DATA_DIR, file_name))
    if "label" in df.columns:
        all_labels.update(df["label"].astype(str).str.strip().unique())
print("Semua label unik di dataset:")
for lbl in sorted(all_labels):
    print(lbl)

all_rows = []

for file_name in all_files:
    file_path = os.path.join(DATA_DIR, file_name)
    if not os.path.exists(file_path):
        continue

    df = pd.read_csv(file_path)
    if "text" not in df.columns or "label" not in df.columns:
        continue

    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df["label"] = df["label"].apply(map_emotion)
    all_rows.append(df[["text", "label"]])

if not all_rows:
    raise RuntimeError("Tidak ada data valid setelah mapping label!")

# Gabungkan semua file
final_df = pd.concat(all_rows, ignore_index=True)

# Simpan standardized CSV
out_path = os.path.join(OUT_DIR, "EmotionDataset_standardized.csv")
final_df.to_csv(out_path, index=False, encoding="utf-8")

# LabelEncoder, abaikan "unknown" jika ingin train model
le = LabelEncoder()
final_df_trainable = final_df[final_df["label"] != "unknown"]
le.fit(final_df_trainable["label"])
joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder_emotion.pkl"))

print("✅ Standardization completed.")
print("Total samples:", len(final_df))
print("Label distribution:")
print(final_df["label"].value_counts())
print("Saved to:", out_path)
