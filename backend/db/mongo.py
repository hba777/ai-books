from pymongo import MongoClient
import gridfs
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)

# ai_books database for users
ai_books_db = client["ai_books"]
users_collection = ai_books_db["users"]

# document_classification database for documents, chunks, review_outcomes, and GridFS
doc_class_db = client["document_classification"]
books_collection = doc_class_db["documents"]
chunks_collection = doc_class_db["chunks"]
review_outcomes_collection = doc_class_db["review_outcomes"]
fs = gridfs.GridFS(doc_class_db)

def get_users_collection():
    return users_collection

def get_books_collection():
    return books_collection

def get_chunks_collection():
    return chunks_collection

def get_review_outcomes_collection():
    return review_outcomes_collection

def get_gridfs():
    return fs