# experiments/audit_dataset.py
import pandas as pd
from glob import glob

DATASET_PATH = "backend/data/EmotionDataset/*.csv"

files = glob(DATASET_PATH)

dfs = []

for file in files:
    try:
        df = pd.read_csv(
            file,
            sep=None,            # auto-detect separator
            engine="python",     # lebih toleran
            encoding="utf-8",
            on_bad_lines="skip"  # skip baris rusak
        )
    except UnicodeDecodeError:
        df = pd.read_csv(
            file,
            sep=None,
            engine="python",
            encoding="latin1",
            on_bad_lines="skip"
        )

    # normalisasi kolom
    df.columns = [c.lower().strip() for c in df.columns]

    # mapping kolom teks
    if "tweet" in df.columns:
        df = df.rename(columns={"tweet": "text"})
    elif "kalimat" in df.columns:
        df = df.rename(columns={"kalimat": "text"})

    # validasi kolom
    if not {"text", "label"}.issubset(df.columns):
        print(f" Skip file (kolom tidak valid): {file}")
        continue

    dfs.append(df[["text", "label"]])

data = pd.concat(dfs, ignore_index=True)

print(" TOTAL DATA:", len(data))

print("\n DISTRIBUSI LABEL:")
print(data["label"].value_counts())

print("\n PERSENTASE LABEL (%):")
print((data["label"].value_counts(normalize=True) * 100).round(2))
