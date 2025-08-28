from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Body
from typing import Dict, Any, Optional
from models.user import User
from utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection,get_agent_configs_collection, get_chunks_collection, fs
from bson import ObjectId
import time
from Classification.app import supervisor_loop
import asyncio
import tempfile

router = APIRouter(prefix="/classification", tags=["Classification"])

@router.post("/{book_id}/start", dependencies=[Depends(get_user_from_cookie)])
async def start_classification(
    book_id: str, 
    background_tasks: BackgroundTasks,
    run_classification: bool = Body(True, embed=True),
    run_analysis: bool = Body(True, embed=True)
) -> Dict[str, Any]:
    try:
        # Validate book_id format
        if not ObjectId.is_valid(book_id):
            raise HTTPException(status_code=400, detail="Invalid book ID format")
        
        # Check if book exists
        book = books_collection.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        file_id = book["file_id"]

        # 3. Retrieve the file from GridFS and write to a temp file
        file_obj = fs.get(file_id)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_obj.read())
            tmp_path = tmp.name

        # Update book status to "Processing"
        books_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": {"status": "Processing", "startDate": time.strftime("%Y-%m-%d %H:%M:%S")}}
        )

        agent_configs_collection = get_agent_configs_collection()
        agents = list(agent_configs_collection.find(
            {"type": "classification", "status": True},  # Filter only active agents
            {"_id": 0, "agent_name": 1, "classifier_prompt": 1, "evaluators_prompt": 1}
        ))

        background_tasks.add_task(supervisor_loop, book_id, agents, run_classification, run_analysis, tmp_path)
        
        return {
            "message": "Processing started successfully",
            "book_id": book_id,
            "status": "Processing",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting processing: {str(e)}")
    
@router.get("/classifications/{book_id}", dependencies=[Depends(get_user_from_cookie)])
def get_book_classifications(book_id: str):
    chunks_collection = get_chunks_collection()

    # Get all chunks for this book_id
    chunks = list(chunks_collection.find({"doc_id": book_id}))

    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for this book.")

    # Return entries with both classification and confidence_score, plus chunk_id
    classifications = []

    for chunk in chunks:
        if "classification" in chunk and chunk["classification"]:
            for c in chunk["classification"]:
                # Include classification, confidence_score, and chunk_id if present
                if isinstance(c, dict) and "classification" in c:
                    entry = {
                        "classification": c.get("classification"),
                        "confidence_score": c.get("confidence_score"),
                        "chunk_id": chunk.get("chunk_id"),  # Add chunk_id for deletion
                        "coordinates": chunk.get("coordinates"),  # Add coordinates for PDF navigation
                        "page_number": chunk.get("page_number")  # Add page number for PDF navigation
                    }
                    classifications.append(entry)

    return {"book_id": book_id, "classifications": classifications}

@router.delete("/{chunk_id}/{label}", dependencies=[Depends(get_user_from_cookie)])
def remove_classification_from_chunk(chunk_id: str, label: str):
    """
    Remove a specific classification result from a chunk by chunk_id and label
    """
    try:
        chunks_collection = get_chunks_collection()
        
        # Find the chunk by chunk_id
        chunk = chunks_collection.find_one({"chunk_id": chunk_id})
        if not chunk:
            raise HTTPException(status_code=404, detail="Chunk not found")
        
        # Check if classification exists
        if "classification" not in chunk or not chunk["classification"]:
            raise HTTPException(status_code=404, detail="No classifications found in this chunk")
        
        # Find and remove the classification with matching label
        original_count = len(chunk["classification"])
        chunk["classification"] = [
            c for c in chunk["classification"] 
            if c.get("classification") != label
        ]
        
        if len(chunk["classification"]) == original_count:
            raise HTTPException(status_code=404, detail=f"Classification with label '{label}' not found")
        
        # Update the chunk in the database
        result = chunks_collection.update_one(
            {"chunk_id": chunk_id},
            {"$set": {"classification": chunk["classification"]}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update chunk")
        
        return {
            "message": f"Successfully removed classification '{label}' from chunk {chunk_id}",
            "chunk_id": chunk_id,
            "removed_label": label,
            "remaining_classifications": len(chunk["classification"])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing classification: {str(e)}")
