#backend/app/db.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pymongo.database import Database

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI tidak ditemukan. Pastikan .env sudah benar")

if not DB_NAME:
    raise RuntimeError("DB_NAME tidak ditemukan. Pastikan .env sudah benar")

client = MongoClient(MONGO_URI)
db: Database = client[DB_NAME]

def get_db() -> Database:
    return db

def get_counseling_collection():
    return db["counseling_sessions"]

def get_emotion_results_collection():
    return db["emotion_results"]  

def get_messages_collection():
    return db["messages"]

def get_recommendations_collection():
    return db["recommendations"]



