import os
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
DATASET_DIR = os.path.join(BASE_DIR, "EmotionDataset")
OUT_DIR = os.path.join(BASE_DIR, "EmotionDataset_clean")
os.makedirs(OUT_DIR, exist_ok=True)

LABEL_MAP = {
    "anger": "marah",
    "fear": "cemas",
    "joy": "senang",
    "sad": "sedih"
}

def load_file(path):
    df = pd.read_csv(
        path,
        sep="\t",
        engine="python",
        on_bad_lines="skip"
    )
    df.columns = ["text", "label"]
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    return df

def main():
    all_df = []

    for fname in os.listdir(DATASET_DIR):
        if not fname.endswith(".csv"):
            continue
        fpath = os.path.join(DATASET_DIR, fname)
        try:
            df = load_file(fpath)
            df["label"] = df["label"].map(LABEL_MAP)
            df = df.dropna(subset=["text", "label"])
            print(f"{fname} → {len(df)} baris valid")
            all_df.append(df)
        except Exception as e:
            print(f"❌ Gagal baca {fname}: {e}")

    if not all_df:
        raise RuntimeError("Dataset kosong!")

    final_df = pd.concat(all_df, ignore_index=True)
    print("\nDistribusi label akhir:")
    print(final_df["label"].value_counts())

    out_path = os.path.join(OUT_DIR, "EmotionDataset_standardized.csv")
    final_df.to_csv(out_path, index=False)
    print("\n✅ Dataset bersih tersimpan di:", out_path)

if __name__ == "__main__":
    main()
