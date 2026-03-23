#backend/app/utils/preprocessing/__init__.py
from .preprocess_tfidf import preprocess_for_tfidf, TfidfVectorizerLoader
from .preprocess_minilm import preprocess_for_minilm, MiniLMEmbedder
from .preprocess_word2vec import preprocess_for_word2vec, Word2VecLoader

# Optional: general function to unify preprocessing
def preprocess_text(text: str):
    """
    Default preprocessing function (MiniLM style)
    """
    return preprocess_for_minilm(text)
