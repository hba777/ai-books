from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.models.documents import BookModel
from backend.utils.jwt_utils import get_user_from_cookie
from db.mongo import books_collection
from pymongo import MongoClient
import os

router = APIRouter()


@router.get("/books", response_model=List[BookModel], dependencies=[Depends(get_user_from_cookie)])
def get_all_books():
    books = list(books_collection.find())
    return books

@router.post("/books", response_model=BookModel, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_user_from_cookie)])
def create_book(book: BookModel):
    book_dict = book.model_dumpt(by_alias=True)
    result = books_collection.insert_one(book_dict)
    book_dict["_id"] = result.inserted_id