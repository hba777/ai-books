from fastapi import APIRouter, Depends, status, HTTPException
from typing import Dict, Any
from models.user import User
from utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection
from bson import ObjectId
import time

router = APIRouter(prefix="/classification", tags=["Classification"])


@router.post("/{book_id}/start", dependencies=[Depends(get_user_from_cookie)])
async def start_classification(book_id: str) -> Dict[str, Any]:
    """
    Dummy API endpoint to start classification for a book.
    In a real implementation, this would trigger the classification process.
    """
    try:
        # Validate book_id format
        if not ObjectId.is_valid(book_id):
            raise HTTPException(status_code=400, detail="Invalid book ID format")
        
        # Check if book exists
        book = books_collection.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Simulate processing time
        time.sleep(1)
        
        # Update book status to "Processing" (dummy update)
        # In real implementation, this would trigger the actual classification
        books_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": {"status": "Processing", "startDate": time.strftime("%Y-%m-%d %H:%M:%S")}}
        )
        
        return {
            "message": "Classification started successfully",
            "book_id": book_id,
            "status": "Processing",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting classification: {str(e)}")
