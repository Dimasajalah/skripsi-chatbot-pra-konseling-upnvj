# File: app/routes/routes_classifier.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.classify_service import classify_text
from app.utils.intent_rule_based import detect_intent
from app.utils.response_generator import generate_response

router = APIRouter(prefix="/classify", tags=["Classifier"])

class ClassifyRequest(BaseModel):
    text: str

class ClassifyResponse(BaseModel):
    intent: str
    intent_confidence: float
    emotion: str
    emotion_confidence: float
    response: str
    response_type: str

@router.post("/", response_model=ClassifyResponse)
async def classify_endpoint(request: ClassifyRequest):
    try:
        result = classify_text(request.text)

        # derive intent using simple rule-based recognizer
        intent = detect_intent(request.text)

        # generate a response text and type based on detected intent + emotion
        resp = generate_response(request.text, emotion=result.get("label", "netral"), intent=intent.get("label", "lainnya"))

        return ClassifyResponse(
            intent=intent.get("label", "lainnya"),
            intent_confidence=float(intent.get("confidence", 0.0)),
            emotion=result.get("label", "netral"),
            emotion_confidence=float(result.get("confidence", 0.0)),
            response=resp.get("response", ""),
            response_type=resp.get("response_type", "general")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
