# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import routes_chatbot, routes_classifier, routes_ws, routes_auth, routes_admin, routes_mahasiswa, routes_psikolog, routes_emotion_result, routes_recommendation, routes_message, routes_chatsession
from app.routes.inference_router import router as inference_router
from app.routes.routes_admin_register import router as admin_register_router
from app.db import get_db
from app.services.schedule_service import generate_schedules_from_psychologists

app = FastAPI(title="Chatbot Pra-Konseling NLP")

@app.on_event("startup")
def init_schedules():
    db = get_db()
    generate_schedules_from_psychologists(db)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://192.168.1.100:5173",  
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_auth.router, prefix="/auth", tags=["Auth"])
app.include_router(routes_chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(routes_classifier.router, prefix="/classifier", tags=["Classifier"])
app.include_router(routes_ws.router, prefix="/ws", tags=["WebSocket"])
app.include_router(routes_admin.router, prefix="/admin", tags=["Admin / Psychologist"])
app.include_router(routes_mahasiswa.router, prefix="/mahasiswa", tags=["Mahasiswa"])
app.include_router(routes_psikolog.router, prefix="/psikolog", tags=["Psikolog"])
app.include_router(inference_router, tags=["Inference"])
app.include_router(admin_register_router)
app.include_router(routes_emotion_result.router, prefix="/emotion-results", tags=["EmotionResult"])
app.include_router(routes_recommendation.router, prefix="/recommendations", tags=["Recommendation"])
app.include_router(routes_message.router, prefix="/messages", tags=["Message"])
app.include_router(routes_chatsession.router, prefix="/chat-sessions", tags=["ChatSession"])