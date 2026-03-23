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
    """Map berbagai variasi label ke empat kategori bahasa Indonesia."""
    if not isinstance(label, str):
        return "unknown"
    label_clean = label.lower().strip()
    label_clean = re.sub(r"[^a-zA-Z]", "", label_clean)

    if "anger" in label_clean or "marah" in label_clean:
        return "marah"
    elif "fear" in label_clean or "takut" in label_clean or "cemas" in label_clean:
        return "cemas"
    elif "joy" in label_clean or "happy" in label_clean or "senang" in label_clean:
        return "senang"
    elif "sad" in label_clean or "sedih" in label_clean:
        return "sedih"
    else:
        return "unknown"

# Ambil semua CSV di folder
all_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")]
all_rows = []

for file_name in all_files:
    file_path = os.path.join(DATA_DIR, file_name)
    if not os.path.exists(file_path):
        continue

    df = pd.read_csv(file_path)
    if "text" not in df.columns or "label" not in df.columns:
        continue

    df["label"] = df["label"].astype(str).apply(map_emotion)
    all_rows.append(df[["text", "label"]])

if not all_rows:
    raise RuntimeError("Tidak ada data valid setelah mapping label!")

# Gabungkan semua file
final_df = pd.concat(all_rows, ignore_index=True)

# Simpan standardized CSV
out_path = os.path.join(OUT_DIR, "EmotionDataset_standardized.csv")
final_df.to_csv(out_path, index=False, encoding="utf-8")

# LabelEncoder untuk training model (abaikan "unknown")
le = LabelEncoder()
final_df_trainable = final_df[final_df["label"] != "unknown"]
le.fit(final_df_trainable["label"])
joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder_emotion.pkl"))

print("✅ Standardization completed.")
print("Total samples:", len(final_df))
print("Label distribution:")
print(final_df["label"].value_counts())
print("Saved to:", out_path)
