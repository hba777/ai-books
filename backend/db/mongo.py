from pymongo import MongoClient
import gridfs
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = MongoClient(MONGO_URI)

# ai_books database for users
ai_books_db = client["ai-books"]
users_collection = ai_books_db["users"]

# document_classification database for documents, chunks, review_outcomes, and GridFS
doc_class_db = client["document_classification"]
books_collection = doc_class_db["documents"]
chunks_collection = doc_class_db["chunks"]
review_outcomes_collection = doc_class_db["review_outcomes"]

review_db = client["review_db"]
agent_configs_collection = review_db["agent_configs"]

knowledge_base_db = client["knowledge_base"]
kb_data_collection = knowledge_base_db["kb_data"]

#Storage for documents using GridFS
fs = gridfs.GridFS(doc_class_db) 

def get_users_collection():
    return users_collection

def get_books_collection():
    return books_collection

def get_chunks_collection():
    return chunks_collection

def get_review_outcomes_collection():
    return review_outcomes_collection

def get_agent_configs_collection():
    return agent_configs_collection

def get_kb_data_collection():
    return kb_data_collection

def get_gridfs():
    return fs

def set_all_agents_status_true():
    agent_configs_collection = get_agent_configs_collection()
    result = agent_configs_collection.update_many(
        {},  # Match all documents
        {"$set": {"status": True}}
    )
    return {"matched": result.matched_count, "modified": result.modified_count}