# backend/app/nlp/nlp_pipeline.py
from dataclasses import dataclass
from app.services.emotion_service import EmotionService
from app.utils.intent_recognizer import IntentRecognizer
from app.risk_detection import detect_risk
from app.utils.preprocessing.preprocess_minilm import preprocess_for_minilm

@dataclass
class NLPResult:
    cleaned_text: str
    emotion_label: str
    emotion_confidence: float
    intent_label: str
    intent_confidence: float
    risk: dict

class NLPPipeline:
    def __init__(
        self,
        emotion_service: EmotionService,
        intent_recognizer: IntentRecognizer
    ):
        self.emotion_service = emotion_service
        self.intent_recognizer = intent_recognizer

    def preprocess(self, text: str) -> str:
        return preprocess_for_minilm(text)

    def analyze(self, raw_text: str) -> NLPResult:
        cleaned = self.preprocess(raw_text)

        emotion = self.emotion_service.predict(cleaned)
        intent_label, intent_conf = self.intent_recognizer.predict_intent(cleaned)

        risk = detect_risk(
            raw_text,
            emotion_label=emotion["label"],
            intent_label=intent_label
        )

        return NLPResult(
            cleaned_text=cleaned,
            emotion_label=emotion["label"],
            emotion_confidence=emotion["confidence"],
            intent_label=intent_label,
            intent_confidence=intent_conf,
            risk=risk
        )


