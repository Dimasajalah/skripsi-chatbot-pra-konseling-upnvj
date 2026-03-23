#backend/text_mongo.py
from pymongo import MongoClient

uri = "mongodb+srv://tekon:tekon@exocluster.3lolzab.mongodb.net/?retryWrites=true&w=majority&appName=ExoCluster"

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("MongoDB server info:", client.server_info())
    print("✓ CONNECTED SUCCESSFULLY!")
except Exception as e:
    print("❌ Connection FAILED:", e)
