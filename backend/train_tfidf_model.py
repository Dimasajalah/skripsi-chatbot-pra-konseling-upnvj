#backend/train_tfidf_model.py
import os
import pandas as pd
import string
import pickle
from gensim.models import Word2Vec
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
import numpy as np

def load_dataset():
    folder = r"C:\Users\DIMAS ANGGORO SAKTI\Dropbox\My PC (LAPTOP-FMDVD92V)\Downloads\New folder (20)\backend\data\EmotionDataset"

    files = [
        "AngerData.csv",
        "FearData.csv",
        "JoyData.csv",
        "SadData.csv"
    ]

    combined = []

    for f in files:
        path = os.path.join(folder, f)
        print("Loading:", path)

        df = pd.read_csv(path, engine="python", sep=None, quotechar='"', on_bad_lines="skip")

        if df.shape[1] == 1:
            df = df.iloc[:, 0].astype(str).str.split(",", n=1, expand=True)

        df = df.iloc[:, :2]
        df.columns = ["text", "label"]
        combined.append(df)

    return pd.concat(combined, ignore_index=True)

def preprocess_text(text):
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return text.split()

def train_word2vec():
    df = load_dataset()
    df["tokens"] = df["text"].astype(str).apply(preprocess_text)

    w2v_model = Word2Vec(
        sentences=df["tokens"].tolist(),
        vector_size=100,
        window=5,
        min_count=1,
        workers=4
    )

    def sentence_vector(tokens):
        vectors = [w2v_model.wv[w] for w in tokens if w in w2v_model.wv]
        if len(vectors) == 0:
            return np.zeros(100)
        return np.mean(vectors, axis=0)

    X = np.vstack(df["tokens"].apply(sentence_vector).values)

    encoder = LabelEncoder()
    y = encoder.fit_transform(df["label"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    clf = GaussianNB()
    clf.fit(X_train, y_train)

    out_dir = r"C:\Users\DIMAS ANGGORO SAKTI\Dropbox\My PC (LAPTOP-FMDVD92V)\Downloads\New folder (20)\backend\model"
    os.makedirs(out_dir, exist_ok=True)

    w2v_model.save(os.path.join(out_dir, "word2vec.model"))

    with open(os.path.join(out_dir, "word2vec_classifier.pkl"), "wb") as f:
        pickle.dump(clf, f)

    with open(os.path.join(out_dir, "label_encoder_word2vec.pkl"), "wb") as f:
        pickle.dump(encoder, f)

    print("\n==============================")
    print("Word2Vec training selesai!")
    print("Model dan label encoder berhasil disimpan.")
    print("==============================\n")

if __name__ == "__main__":
    train_word2vec()
