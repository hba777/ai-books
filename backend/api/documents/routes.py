from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from typing import List
from models.documents import BookModel
from utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection, fs
from .schemas import BookResponse


router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/", response_model=List[BookResponse], dependencies=[Depends(get_user_from_cookie)])
def get_all_books():
    books = list(books_collection.find())
    return [
        BookResponse(**{**book, "_id": str(book["_id"])})  # Convert ObjectId → str
        for book in books
    ]

@router.post(
    "/",
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
    # Save file to GridFS
    file_id = fs.put(await file.read(), filename=file.filename, doc_id=doc_id)

    # Create BookModel instance (instead of dict)
    book = BookModel(
        doc_id=doc_id,
        doc_name=doc_name,
        status=status_,
        summary=summary
    )

    # Convert to dict for MongoDB and add file_id
    book_dict = book.dict(by_alias=True)
    book_dict["file_id"] = file_id

    # Insert into MongoDB
    result = books_collection.insert_one(book_dict)

    # Return API response using BookResponse
    return BookResponse(
        _id=str(result.inserted_id),
        doc_id=doc_id,
        doc_name=doc_name,
        status=status_,
        summary=summary
    )