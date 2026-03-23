#backend/check_csv.py
import pandas as pd
import glob, os

DATA_DIR = r"backend/data/EmotionDataset"

files = sorted(glob.glob(os.path.join(DATA_DIR, "*Data.csv")))

for f in files:
    print(f"Checking: {f}")
    try:
        df = pd.read_csv(f, engine="python", encoding="utf-8")
        print(f"  OK: {df.shape}")
    except Exception as e:
        print(f"  ERROR in {f}: {e}")
