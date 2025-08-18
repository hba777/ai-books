"""MongoDB connections and operations"""
import os
import uuid
import json
from pymongo import ASCENDING # Import ASCENDING for sorting
from dotenv import load_dotenv
from typing import List, Dict, Any 
from bson import ObjectId
from db.mongo import (
    get_books_collection,
    get_chunks_collection,
    set_all_agents_status_true
)

from Analysis.mains1 import run_workflow

import asyncio
from api.chunks.websocket_manager import get_client

load_dotenv(override=True)

def insert_document(doc_id: str, chunks: list, summary: str):
    books_collection = get_books_collection()
    chunks_collection = get_chunks_collection()

    # Prepare chunk documents
    chunk_docs = []
    for i, chunk in enumerate(chunks):
        # Extracting coordinates and page from the chunk's metadata
        page_number = chunk.metadata.get("page", None)
        coordinates = chunk.metadata.get("coordinates", None)

        chunk_docs.append({
            "chunk_id": str(uuid.uuid4()),
            "doc_id": doc_id,
            "chunk_index": i,
            "text": chunk.page_content,
            "page_number": page_number,
            "coordinates": coordinates,  # <-- NEW: Coordinates are now saved
            "status": "pending",
            "analysis_status": "pending"
        })

    # Insert all chunks
    chunks_collection.insert_many(chunk_docs)

    books_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {
            "summary": summary,
            "status": "Pending"
        }}
    )

    # Notify frontend via websocket that indexing is done
    try:
        from api.chunks.websocket import notify_indexing_done
        asyncio.run(notify_indexing_done(doc_id))
    except Exception as e:
        print(f"[WebSocket Notify] Failed to notify for doc_id {doc_id}: {e}")

    return doc_id

def fetch_next_pending_chunk(doc_id):
    """Fetch the next pending chunk index for the given document."""
    chunks_collection = get_chunks_collection()
    chunk = chunks_collection.find_one(
        {"doc_id": doc_id, "status": "pending"},
        sort=[("chunk_index", 1)]
    )
    return chunk["chunk_index"] if chunk else None

def fetch_chunk_context(doc_id: str, chunk_index: int):
    """Fetch the specified chunk along with its immediate neighbors."""
    chunks_collection = get_chunks_collection()

    # Fetch current chunk
    current_chunk_cursor = chunks_collection.find(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"text": 1, "_id": 0}
    )
    current_chunk_text = next(current_chunk_cursor, {}).get("text", "")

    # Fetch previous and next chunks
    previous_chunks = list(chunks_collection.find(
        {"doc_id": doc_id, "chunk_index": {"$lt": chunk_index}},
        {"text": 1, "_id": 0}
    ).sort("chunk_index", -1).limit(2)) # Get up to 2 previous, sorted descending
    previous_text = " ".join([c["text"] for c in reversed(previous_chunks)]) # Reverse to get correct order

    next_chunks = list(chunks_collection.find(
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
    chunks_collection = get_chunks_collection()
    chunks_collection.update_one(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"$set": {"status": "done"}}
    )
    total = get_total_chunks(doc_id)
    done = get_done_chunks_count(doc_id) 
    progress = int((done / total) * 100)
    notify_client(doc_id, progress, total, done)

def notify_client(book_id: str, progress: int, total: int, done: int):
    ws = get_client(book_id)
    if ws:
        try:
            asyncio.run(ws.send_json({"progress": progress, "total": total, "done": done}))
        except Exception as e:
            print(f"Failed to send to client: {e}")

def get_total_chunks(doc_id):
    chunks_collection = get_chunks_collection()
    return chunks_collection.count_documents({"doc_id": doc_id})

def get_done_chunks_count(doc_id):
    chunks_collection = get_chunks_collection()
    return chunks_collection.count_documents({"doc_id": doc_id, "status": "done"})

def get_chunk_id(doc_id: str, chunk_index: int):
    """Retrieve chunk_id based on doc_id and chunk_index."""
    chunks_collection = get_chunks_collection()
    chunk = chunks_collection.find_one(
        {"doc_id": doc_id, "chunk_index": chunk_index},
        {"chunk_id": 1, "_id": 0}
    )
    return chunk["chunk_id"] if chunk else None

def save_classification_result(chunk_id: str, classification_results: list):
    """Save classification results for a chunk and mark status as complete."""
    chunks_collection = get_chunks_collection()
    chunks_collection.update_one(
        {"chunk_id": chunk_id},
        {
            "$set": {
                "classification": classification_results
            }
        }
    )
 
def extract_results_for_pdf(doc_id: str) -> List[Dict[str, Any]]:
    """
    Extracts relevant chunk data and classification results for PDF generation.
    Returns a list of dictionaries, each representing a classification outcome
    for a chunk, suitable for HTML rendering.
    """
    chunks_collection = get_chunks_collection()
    # Fetch all chunks for the given doc_id, sorted by chunk_index
    chunks_cursor = chunks_collection.find(
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
    books_collection = get_books_collection()
    chunks_collection = get_chunks_collection()

    doc = books_collection.find_one({"doc_id": doc_id})
    doc_name = doc["doc_name"] if doc else "Unknown Document"

    cursor = chunks_collection.find({"doc_id": doc_id}, {"classification": 1})
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
    """Update the status of a document to 'Processed' regardless of current status."""
    books_collection = get_books_collection()
    chunks_collection = get_chunks_collection()
    result = books_collection.update_one(
        {"_id": ObjectId(doc_id)},  
        {"$set": {"status": "Processed"}}
    )
    if result.matched_count == 0:
        print(f"⚠️ Document with id {doc_id} not found.")

    """Add Classification labels to the book"""    
    chunks = chunks_collection.find({"doc_id": doc_id}, {"classification": 1})

    # Step 4: Extract all unique classification strings
    unique_labels = set()
    for chunk in chunks:
        if chunk.get("classification"):
            for cls in chunk["classification"]:
                if isinstance(cls, dict) and "classification" in cls:
                    unique_labels.add(cls["classification"])

    # Step 5: Update the book's labels array
    books_collection.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"labels": list(unique_labels)}}
    )

    run_workflow(book_id=doc_id)

    set_all_agents_status_true() # Call this at end of run workflow

    print("\n####################")
    print("Document Marked Processed")
    print("Labels updated:", list(unique_labels))
    print("####################\n")
    print("\n####################\nDocument Marked Processed\n####################\n")


def get_pending_documents():
    """Returns a list of doc_id values where status is not 'Processed'."""
    books_collection = get_books_collection()
    cursor = books_collection.find({"status": {"$ne": "Processed"}}, {"doc_id": 1})
    return [doc["doc_id"] for doc in cursor]

def get_document_summary(doc_id: str):
    """
    Retrieves summary information for a given document from the 'documents' collection.
    """
    books_collection = get_books_collection()
    document = books_collection.find_one(
        {"doc_id": doc_id},
        {"doc_name": 1, "summary": 1, "_id": 0}
    )
    return document if document else None