# backend/tests/test_embed_text.py
import pytest
import numpy as np
from app.nlp.nlp_pipeline import embed_text, preprocess

@pytest.mark.skipif(False, reason="Set to True to skip if model not present")
def test_embed_shape_and_norm():
    emb, pre = embed_text("Saya merasa cemas menjelang ujian besok")
    assert isinstance(pre, str)
    assert isinstance(emb, (list, np.ndarray))
    arr = np.array(emb)
    assert arr.ndim == 1
    norm = float(np.linalg.norm(arr))
    assert pytest.approx(1.0, rel=1e-3) == norm
