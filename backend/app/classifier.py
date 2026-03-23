# backend/app/classifier.py
import numpy as np
from app.nlp.sbert_loader import MiniLMEmbedder
from app.utils.preprocessing.preprocess_minilm import preprocess_for_minilm
from app.utils.preprocessing.preprocess_tfidf import preprocess_for_tfidf
from app.utils.preprocessing.preprocess_word2vec import preprocess_for_word2vec

class MiniLMClassifier:
    def __init__(self, model, label_encoder):
        self.model = model
        self.encoder = label_encoder
        self.embedder = MiniLMEmbedder()

    def predict(self, text: str):
        clean = preprocess_for_minilm(text)
        emb = self.embedder.encode(clean)

        pred = self.model.predict([emb])[0]
        label = self.encoder.inverse_transform([pred])[0]

        return {
            "model": "MiniLM",
            "clean_text": clean,
            "embedding_dim": len(emb),
            "prediction": label
        }


class TFIDFClassifier:
    def __init__(self, model, vectorizer, label_encoder):
        self.model = model
        self.vectorizer = vectorizer
        self.encoder = label_encoder

    def predict(self, text: str):
        clean = preprocess_for_tfidf(text)
        vec = self.vectorizer.transform([clean])

        pred = self.model.predict(vec)[0]
        label = self.encoder.inverse_transform([pred])[0]

        return {
            "model": "TF-IDF",
            "clean_text": clean,
            "prediction": label
        }


class Word2VecClassifier:
    def __init__(self, model, w2v, label_encoder):
        self.model = model
        self.w2v = w2v
        self.encoder = label_encoder

    def _sentence_vector(self, tokens):
        vectors = []
        for token in tokens:
            if token in self.w2v:
                vectors.append(self.w2v[token])
        if not vectors:
            return np.zeros(self.w2v.vector_size)
        return np.mean(vectors, axis=0)

    def predict(self, text: str):
        tokens = preprocess_for_word2vec(text)
        vec = self._sentence_vector(tokens)

        pred = self.model.predict([vec])[0]
        label = self.encoder.inverse_transform([pred])[0]

        return {
            "model": "Word2Vec",
            "clean_text": " ".join(tokens),
            "prediction": label
        }
