import pymongo
from typing import Dict, Any, List # List import remains for general type hinting
from config import MONGO_URI, PDF_DB_NAME, PDF_COLLECTION_NAME
import os
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId
from db.mongo import get_review_outcomes_collection, get_chunks_collection

load_dotenv()

# --- MongoDB Configuration for Final Results ---
RESULTS_DB_NAME = os.getenv("RESULTS_DB_NAME1")
RESULTS_COLLECTION_NAME = os.getenv("RESULTS_COLLECTION_NAM1")

def clear_results_collection():
    """
    Clears all documents from the RESULTS_COLLECTION_NAME in RESULTS_DB_NAME.
    This should be called at the beginning of each program execution to ensure a fresh start.
    """
    try:
        results_collection = get_review_outcomes_collection,()
        delete_result = results_collection.delete_many({})
        print(f"🧹 Cleared {delete_result.deleted_count} documents from results collection.")
    except Exception as e:
        print(f"❌ An unexpected error occurred while clearing results collection: {e}")

def save_results_to_mongo(
    chunk_uuid: str,
    doc_id: str,
    chunk_index: int,
    report_text: str,
    book_name: str,
    predicted_label: str,
    classification_scores: Dict[str, float],
    result_with_review: Dict,
    overall_chunk_status: str,
    agent_analysis_statuses: Dict
):
    """Saves the comprehensive analysis results of a chunk to a MongoDB collection."""
    try:
        results_collection = get_review_outcomes_collection,()
        result_document = {
            "timestamp": datetime.now(),
            "doc_id": doc_id,
            "Book Name": book_name,
            "Page Number": "N/A",
            "Chunk_ID": chunk_uuid,
            "Chunk no.": chunk_index,
            "Text Analyzed": report_text,
            "Predicted Label": predicted_label,
            "Predicted Label Confidence": classification_scores.get(predicted_label, 0.0),
            "overall_status": overall_chunk_status,
        }
        main_node_output = result_with_review.get("main_node_output", {})
        for agent_name, agent_status in agent_analysis_statuses.items():
            agent_data = main_node_output.get(agent_name, {})
            agent_output = agent_data.get("output", {})
            agent_result = {
                "issue_found": agent_output.get("issues_found", False),
                "problematic_text": agent_output.get("problematic_text", ""),
                "observation": agent_output.get("observation", ""),
                "recommendation": agent_output.get("recommendation", ""),
                "confidence": agent_data.get("confidence", 0),
                "human_review": agent_data.get("human_review", False),
                "retries": agent_data.get("retries", 0),
                "status": agent_status
            }
            result_document[agent_name] = agent_result
        results_collection.insert_one(result_document)
        print(f"✅ Analysis results for chunk ID '{chunk_uuid}' saved to MongoDB in results collection.")
    except Exception as e:
        print(f"❌ An unexpected error occurred while saving results to MongoDB: {e}")

def update_chunk_analysis_status(doc_id: str, chunk_id: str, analysis_status: str):
    """
    Updates the 'analysis_status' field of a chunk in the Pipeline 1 'chunks' collection
    to reflect the analysis outcome (e.g., 'Complete', 'Pending'). This field is separate from the
    original 'status' field.
    """
    try:
        chunks_collection = get_chunks_collection()
        update_result = chunks_collection.update_one(
            {"doc_id": doc_id, "chunk_id": chunk_id},
            {"$set": {"analysis_status": analysis_status}}
        )
        if update_result.matched_count > 0:
            print(f"✅ Chunk '{chunk_id}' in document '{doc_id}' analysis_status updated to '{analysis_status}'.")
        else:
            print(f"⚠️ Chunk '{chunk_id}' in document '{doc_id}' not found for analysis_status update.")
    except Exception as e:
        print(f"❌ An unexpected error occurred while updating chunk status: {e}")