from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from typing import List
from backend.models.documents import BookModel
from backend.utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection, fs
from .schemas import BookResponse
from pymongo import MongoClient
import gridfs
import os

router = APIRouter()


@router.get("/books", response_model=List[BookResponse], dependencies=[Depends(get_user_from_cookie)])
def get_all_books():
    books = list(books_collection.find())
    # Convert to BookResponse models
    return [BookResponse(**{**book, "_id": str(book["_id"])}) for book in books]

@router.post(
    "/books",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_user_from_cookie)]
)
async def create_book(
    doc_id: str = Form(...),
    doc_name: str = Form(...),
    status_: str = Form(..., alias="status"),
    summary: str = Form(...),
    file: UploadFile = File(...)
):
    # Save file to GridFS with doc_id as metadata
    file_id = fs.put(await file.read(), filename=file.filename, doc_id=doc_id)

    # Create BookModel instance
    book = BookModel(
        _id=None,  # Will be set after insert
        doc_id=doc_id,
        doc_name=doc_name,
        status=status_,
        summary=summary
    )
    # Insert into MongoDB
    book_dict = book.dict(by_alias=True, exclude={"_id"})
    book_dict["file_id"] = file_id
    result = books_collection.insert_one(book_dict)
    # Return as BookResponse
    return BookResponse(
        _id=str(result.inserted_id),
        doc_id=doc_id,
        doc_name=doc_name,
        status=status_,
        summary= summary
    )