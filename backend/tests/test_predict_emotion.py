# backend/tests/test_predict_emotion.py
import pytest
from app.classifier import predict_emotion

@pytest.mark.skipif(False, reason="Skip if model is not available in CI")
def test_predict_emotion_output_keys():
    res = predict_emotion("saya merasa sedih dan cemas")
    assert isinstance(res, dict)
    assert "emotion" in res
    assert "emotion_confidence" in res
    assert "cleaned_text" in res
    conf = float(res.get("emotion_confidence", 0.0))
    assert 0.0 <= conf <= 1.0
