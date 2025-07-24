from fastapi import APIRouter, Depends
from typing import List
from backend.models.chunks import ChunkModel
from backend.utils.jwt_utils import get_user_from_cookie
from backend.db.mongo import get_chunks_collection

router = APIRouter(prefix="/Chunks", tags=["Chunks"])

@router.get("/chunks", response_model=List[ChunkModel], dependencies=[Depends(get_user_from_cookie)])
def get_all_chunks():
    chunks_collection = get_chunks_collection()
    chunks = list(chunks_collection.find())
    return chunks

@router.get("/chunks/count", dependencies=[Depends(get_user_from_cookie)])
def get_chunks_count():
    chunks_collection = get_chunks_collection()
    count = chunks_collection.count_documents({})
    return {"count", count}