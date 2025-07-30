"""MongoDB connections and operations"""
import os
import uuid
import json
from pymongo import MongoClient, ASCENDING # Import ASCENDING for sorting
from dotenv import load_dotenv
from typing import List, Dict, Any # Import for type hinting

load_dotenv(override=True)

def create_connection():
    """Creates and returns MongoDB database instance"""
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("MONGO_DB_NAME")]
    return db

def insert_document(file_path: str, chunks: list, summary: str):
    """Insert the chunked documents into MongoDB"""
    doc_id = str(uuid.uuid4())
    doc_name = file_path.split("/")[-1]
    print(f"Working on document: {doc_name}")

    db = create_connection()
    db.documents.insert_one({
        "doc_id": doc_id,
        "doc_name": doc_name,
        "summary": summary,
        "status": "in_progress"
    })

    chunk_docs = []
    for i, chunk in enumerate(chunks):
        chunk_docs.append({
            "chunk_id": str(uuid.uuid4()),
            "doc_id": doc_id,
            "chunk_index": i,
            "text": chunk,
            "status": "pending",
            "analysis_status": "pending"  # <--- YAHAN YE NAYA FIELD ADD KIYA HAI
        })

    db.chunks.insert_many(chunk_docs)
    print(f"Saved file: {doc_name} in database!")
    return doc_id

def fetch_next_pending_chunk(doc_id):
    """Fetch the next pending chunk index for the given document."""
    db = create_connection()
    chunk = db.chunks.find_one(
        {"doc_id": doc_id, "status": "pending"},
        sort=[("chunk_index", 1)]
    )
    return chunk["chunk_index"] if chunk else None

def fetch_chunk_context(doc_id: str, chunk_index: int):
    """Fetch the specified chunk along with its immediate neighbors."""
    db = create_connection()
    
    # Fetch current chunk
    current_chunk_cursor = db.chunks.find(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"text": 1, "_id": 0}
    )
    current_chunk_text = next(current_chunk_cursor, {}).get("text", "")

    # Fetch previous and next chunks
    previous_chunks = list(db.chunks.find(
        {"doc_id": doc_id, "chunk_index": {"$lt": chunk_index}},
        {"text": 1, "_id": 0}
    ).sort("chunk_index", -1).limit(2)) # Get up to 2 previous, sorted descending
    previous_text = " ".join([c["text"] for c in reversed(previous_chunks)]) # Reverse to get correct order

    next_chunks = list(db.chunks.find(
        {"doc_id": doc_id, "chunk_index": {"$gt": chunk_index}},
        {"text": 1, "_id": 0}
    ).sort("chunk_index", 1).limit(2)) # Get up to 2 next, sorted ascending
    next_text = " ".join([c["text"] for c in next_chunks])

    return {
        "previous": previous_text,
        "current": current_chunk_text,
        "next": next_text
    }

def mark_chunk_as_done(doc_id, chunk_index):
    """Mark a chunk as done in the database."""
    db = create_connection()
    db.chunks.update_one(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"$set": {"status": "done"}}
    )

def get_chunk_id(doc_id: str, chunk_index: int):
    """Retrieve chunk_id based on doc_id and chunk_index."""
    db = create_connection()
    chunk = db.chunks.find_one(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"chunk_id": 1, "_id": 0}
    )
    return chunk["chunk_id"] if chunk else None

def save_classification_result(chunk_id: str, classification_results: list):
    """Save classification results for a chunk."""
    db = create_connection()
    db.chunks.update_one(
        {"chunk_id": chunk_id},
        {"$set": {"classification": classification_results}}
    )

def extract_results_for_pdf(doc_id: str) -> List[Dict[str, Any]]:
    """
    Extracts relevant chunk data and classification results for PDF generation.
    Returns a list of dictionaries, each representing a classification outcome
    for a chunk, suitable for HTML rendering.
    """
    db = create_connection()
    # Fetch all chunks for the given doc_id, sorted by chunk_index
    chunks_cursor = db.chunks.find(
        {"doc_id": doc_id},
        {"_id": 0, "chunk_id": 1, "chunk_index": 1, "text": 1, "classification": 1}
    ).sort("chunk_index", ASCENDING)

    results_list = []
    for chunk_doc in chunks_cursor:
        chunk_id = chunk_doc.get("chunk_id")
        chunk_index = chunk_doc.get("chunk_index")
        chunk_text = chunk_doc.get("text")
        classifications_from_db = chunk_doc.get("classification", [])

        if classifications_from_db:
            for cls_info in classifications_from_db:
                results_list.append({
                    "chunk_id": chunk_id,
                    "chunk_index": chunk_index,
                    "chunk_text": chunk_text,
                    "classification": cls_info.get("classification"),
                    "confidence_score": cls_info.get("confidence_score"),
                    "agent_name": cls_info.get("name")
                })
        else:
            # If no classification found, still include the chunk with N/A values
            results_list.append({
                "chunk_id": chunk_id,
                "chunk_index": chunk_index,
                "chunk_text": chunk_text,
                "classification": "N/A",
                "confidence_score": "N/A",
                "agent_name": "N/A"
            })
    return results_list

def extract_summary_for_pdf(doc_id):
    """Extract summary info for PDF generation."""
    db = create_connection()

    doc = db.documents.find_one({"doc_id": doc_id})
    doc_name = doc["doc_name"] if doc else "Unknown Document"

    cursor = db.chunks.find({"doc_id": doc_id}, {"classification": 1})
    class_counts = {}

    for doc in cursor:
        classifications = doc.get("classification", [])
        for cls in classifications:
            # Assuming 'cls' is a dictionary with a 'classification' key
            label = cls.get('classification')
            if label:
                class_counts[label] = class_counts.get(label, 0) + 1

    return {
        "doc_name": doc_name,
        "class_counts": class_counts
    }

def mark_document_done(doc_id):
    """Update the status of a document to 'done'."""
    db = create_connection()
    db.documents.update_one(
        {"doc_id": doc_id, "status": "in_progress"},
        {"$set": {"status": "done"}}
    )
    print("\n####################\nDocument Marked Done\n####################\n")

def get_pending_documents():
    """Returns a list of doc_id values where status is not 'done'."""
    db = create_connection()
    cursor = db.documents.find({"status": {"$ne": "done"}}, {"doc_id": 1})
    return [doc["doc_id"] for doc in cursor]

def get_document_summary(doc_id: str):
    """
    Retrieves summary information for a given document from the 'documents' collection.
    """
    db = create_connection()
    document = db.documents.find_one(
        {"doc_id": doc_id},
        {"doc_name": 1, "summary": 1, "_id": 0}
    )
    return document if document else None