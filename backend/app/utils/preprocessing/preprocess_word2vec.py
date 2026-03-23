#backend/app/utils/preprocessing/preprocess_word2vec.py
import pickle
from pathlib import Path
from .base_cleaner import minimal_clean, normalize_slang, remove_stopwords

def preprocess_for_word2vec(text: str):
    if not text:
        return []

    text = minimal_clean(text)
    text = normalize_slang(text)

    tokens = text.split()
    tokens = remove_stopwords(tokens)

    return tokens

class Word2VecLoader:
    def __init__(
        self,
        model_path: str = "model/word2vec.model",
        classifier_path: str = "model/word2vec_classifier.pkl",
    ):
        self.model_path = Path(model_path)
        self.classifier_path = Path(classifier_path)
        self.model = None
        self.classifier = None
        self._load()

    def _load(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Word2Vec model not found at {self.model_path.resolve()}"
            )
        if not self.classifier_path.exists():
            raise FileNotFoundError(
                f"Word2Vec classifier not found at {self.classifier_path.resolve()}"
            )
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)
        with open(self.classifier_path, "rb") as f:
            self.classifier = pickle.load(f)

    def encode(self, text: str):
        tokens = preprocess_for_word2vec(text)
        if not tokens:
            return None
        vectors = [self.model.wv[token] for token in tokens if token in self.model.wv]
        if not vectors:
            return None
        return sum(vectors) / len(vectors)
