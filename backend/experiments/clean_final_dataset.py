import pandas as pd
from pathlib import Path

DATA_DIR = Path("backend/data/EmotionDataset_cleaned")  # pakai hasil clean_dataset.py
OUTPUT_PATH = Path("backend/data/final_emotion_dataset.csv")

# Gunakan label yang sudah standard (bahasa Indonesia)
VALID_LABELS = {"senang", "sedih", "marah", "cemas"}

cleaned_rows = []

for file in DATA_DIR.glob("*.csv"):
    try:
        df = pd.read_csv(file)
    except Exception as e:
        print(f" Skip file error: {file.name} ({e})")
        continue

    df.columns = [c.lower().strip() for c in df.columns]

    if "tweet" in df.columns:
        text_col = "tweet"
    elif "text" in df.columns:
        text_col = "text"
    else:
        print(f" Skip (no text column): {file.name}")
        continue

    if "label" not in df.columns:
        print(f" Skip (no label column): {file.name}")
        continue

    # Cleaning label
    df["label"] = df["label"].astype(str).str.lower().str.strip()

    before = len(df)
    df = df[df["label"].isin(VALID_LABELS)]
    after = len(df)

    if after == 0:
        print(f" Skip (no valid labels): {file.name}")
        continue

    print(f" {file.name}: {before} → {after}")
    cleaned_rows.append(df[[text_col, "label"]])

if not cleaned_rows:
    raise RuntimeError("Tidak ada data valid yang ditemukan untuk final dataset!")

final_df = pd.concat(cleaned_rows, ignore_index=True)
final_df.columns = ["text", "label"]
final_df.to_csv(OUTPUT_PATH, index=False)

print("\n✨ FINAL DATASET SAVED")
print("Total samples:", len(final_df))
print("Label distribution:")
print(final_df["label"].value_counts())
