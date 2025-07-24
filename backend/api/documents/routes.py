from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from typing import List, Optional
from models.documents import BookModel
from utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection, fs
from .schemas import BookResponse
import json

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/", response_model=List[BookResponse], dependencies=[Depends(get_user_from_cookie)])
def get_all_books():
    books = list(books_collection.find())
    return [
        BookResponse(**{**book, "_id": str(book["_id"])})
        for book in books
    ]


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

@router.delete(
    "/",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_user_from_cookie)]
)
def delete_all_books():
    result = books_collection.delete_many({})
    return {"detail": f"Deleted {result.deleted_count} books."}
