from fastapi import APIRouter, Depends, BackgroundTasks
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_chunks_collection, get_agent_configs_collection
from .schemas import ChunkResponse, ChunkListResponse
import os
import json
import time
from Classification.app import supervisor_loop

router = APIRouter(prefix="/chunks", tags=["Chunks"])

done = []

@router.post("/index-book/{book_id}")
def index_book(book_id: str, background_tasks: BackgroundTasks):
    agent_configs_collection = get_agent_configs_collection()
    agents = list(agent_configs_collection.find({}, {"_id": 0, "agent_name": 1, "classifier_prompt": 1, "evaluator_prompt": 1}))
    background_tasks.add_task(supervisor_loop, book_id, agents)
    return {"message": f"Indexing started for book {book_id}", "agents": agents}

@router.get("/", response_model=ChunkListResponse, dependencies=[Depends(get_user_from_cookie)])
def get_all_chunks():
    chunks_collection = get_chunks_collection()
    chunks = list(chunks_collection.find())

    # Convert ObjectId to string
    for chunk in chunks:
        chunk["_id"] = str(chunk["_id"])

    return ChunkListResponse(items=[ChunkResponse(**chunk) for chunk in chunks])


@router.get("/count", dependencies=[Depends(get_user_from_cookie)])
def get_chunks_count():
    chunks_collection = get_chunks_collection()
    count = chunks_collection.count_documents({})
    return {"count": count}
