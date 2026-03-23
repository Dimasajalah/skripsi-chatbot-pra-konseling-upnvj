#backend/app/routes/inference_router.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.classify_service import ClassificationService
from app.utils.preprocessing import preprocess_text
from app.models.model_minilm import predict_emotion_minilm

service = ClassificationService()

router = APIRouter(prefix="/inference")

class InputText(BaseModel):
    text: str

@router.post("/minilm")
def predict_minilm(data: InputText):
    return {"model": "minilm", "result": service.predict_minilm(data.text)}

@router.post("/tfidf")
def predict_tfidf(data: InputText):
    return {"model": "tfidf", "result": service.predict_tfidf(data.text)}

@router.post("/word2vec")
def predict_word2vec(data: InputText):
    return {"model": "word2vec", "result": service.predict_word2vec(data.text)}

@router.post("/all")
def predict_all(data: InputText):
    return {"model": "all", "result": service.predict_all(data.text)}

@router.post("/ensemble")
def predict_ensemble(data: InputText):
    return {"model": "ensemble", "result": service.predict_ensemble(data.text)}

class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict

@router.post("/predict", response_model=PredictResponse)
def predict_final(data: InputText):
    """
    Endpoint FINAL untuk skripsi
    Model: MiniLM + Logistic Regression (best C=10)
    """
    return predict_emotion_minilm(data.text)
