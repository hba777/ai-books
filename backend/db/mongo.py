from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "ai_books")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_users_collection():
    return db["users"] 