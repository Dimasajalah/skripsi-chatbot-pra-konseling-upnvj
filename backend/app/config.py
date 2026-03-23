#backend/app/config.py
import os
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings:
    MONGO_URI = os.getenv("MONGO_URI")
    DB_NAME = os.getenv("DB_NAME", "chatdb")

    JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

    INTENT_MODEL_PATH = os.getenv(
        "INTENT_MODEL_PATH",
        os.path.join(BASE_DIR, "model", "intent", "intent_clf_sbert512.pkl")
    )
    INTENT_LABEL_ENCODER_PATH = os.getenv(
        "INTENT_LABEL_ENCODER_PATH",
        os.path.join(BASE_DIR, "model", "intent", "intent_label_encoder_sbert512.pkl")
    )

settings = Settings()
