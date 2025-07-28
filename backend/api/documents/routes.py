from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
from models.documents import BookModel
from models.user import User
from utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection, fs
from .schemas import BookResponse, BookDeleteResponse, FeedbackRequest, FeedbackModel
import json
from bson import ObjectId
from datetime import datetime


router = APIRouter(prefix="/books", tags=["Books"])


#Get All books
@router.get("/", response_model=List[BookResponse], dependencies=[Depends(get_user_from_cookie)])
def get_all_books():
    books = list(books_collection.find())
    return [
        BookResponse(**{**book, "_id": str(book["_id"])})
        for book in books
    ]


# Create a new book
@router.post(
    "/",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_user_from_cookie)]
)
async def create_book(
    doc_name: str = Form(...),
    author: str = Form(...),
    date: str = Form(...),
    category: str = Form(...),
    reference: str = Form(...),
    status: str = Form(...),
    summary: str = Form(...),
    labels: Optional[str] = Form("[]"),  # JSON string from frontend
    startDate: Optional[str] = Form(None),
    endDate: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    
    # Parse labels JSON safely
    try:
        labels_list = json.loads(labels) if labels else []
    except json.JSONDecodeError:
        labels_list = []

    # Save file to GridFS
    file_id = fs.put(await file.read(), filename=file.filename)

    # Prepare book data WITHOUT setting _id (Mongo will generate it)
    book = BookModel(
        doc_id="",  # placeholder (will be updated after insert)
        doc_name=doc_name,
        author=author,
        date=date,
        category=category,
        reference=reference,
        status=status,
        summary=summary,
        labels=labels_list,
        startDate=startDate,
        endDate=endDate
    )

    # Convert to dict and remove _id=None
    book_dict = book.dict(by_alias=True, exclude_none=True)
    if "_id" in book_dict:
        del book_dict["_id"]

    # Add file_id
    book_dict["file_id"] = file_id

    # Insert into MongoDB
    result = books_collection.insert_one(book_dict)
    inserted_id = str(result.inserted_id)

    # Update doc_id to match generated _id
    books_collection.update_one({"_id": result.inserted_id}, {"$set": {"doc_id": inserted_id}})

    # Return response
    return BookResponse(
        _id=inserted_id,
        doc_id=inserted_id,
        doc_name=doc_name,
        author=author,
        date=date,
        category=category,
        reference=reference,
        status=status,
        summary=summary,
        labels=labels_list,
        startDate=startDate,
        endDate=endDate
    )

# Get a book by ID
@router.get(
    "/{book_id}",
    response_model=BookResponse,
    dependencies=[Depends(get_user_from_cookie)]
)
def get_book_by_id(book_id: str):
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    book["_id"] = str(book["_id"])
    return BookResponse(**book)

# Get a book file by ID
@router.get(
    "/{book_id}/file",
    response_class=StreamingResponse,
    dependencies=[Depends(get_user_from_cookie)]
)
def get_book_file(book_id: str):
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book or "file_id" not in book:
        raise HTTPException(status_code=404, detail="File not found")
    file_id = book["file_id"]
    file_obj = fs.get(file_id)
    return StreamingResponse(file_obj, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{file_obj.filename}"'
    })

# Assign book to departmnent
@router.put("/{book_id}/assign", dependencies=[Depends(get_user_from_cookie)])
def assign_departments(book_id: str, departments: List[str]):
    result = books_collection.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {"assigned_departments": departments}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Book not found or no change")
    return {"message": "Departments assigned successfully"}

# Add Feedback to book
@router.post("/{book_id}/feedback")
def add_feedback(book_id: str, comment: FeedbackRequest, user: User = Depends(get_user_from_cookie)):
    # Check if user department is assigned to book
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if user.department not in book.get("assigned_departments", []):
        raise HTTPException(status_code=403, detail="Not allowed to give feedback")

    feedback = FeedbackModel(
        user_id=user.id,
        username=user.username,
        department=user.department,
        comment=comment.comment,
        timestamp=datetime.utcnow().isoformat()
    )

    books_collection.update_one(
        {"_id": ObjectId(book_id)},
        {"$push": {"feedback": feedback.dict()}}
    )

    return {"message": "Feedback added successfully"}
# Delete all books
@router.delete(
    "/",
    response_model=BookDeleteResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_all_books():
    result = books_collection.delete_many({})
    return BookDeleteResponse(detail=f"Deleted {result.deleted_count} books.")

# Delete book by ID
@router.delete(
    "/{book_id}",
    response_model=BookDeleteResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_book_by_id(book_id: str):
    result = books_collection.delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookDeleteResponse(detail="Book deleted successfully.")

