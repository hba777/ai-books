from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_chunks_collection, get_agent_configs_collection, books_collection, fs
from .schemas import ChunkResponse, ChunkListResponse
import tempfile
from bson import ObjectId
from Classification.index_document import index

router = APIRouter(prefix="/chunks", tags=["Chunks"])

done = []

@router.post("/index-book/{book_id}")
def index_book(book_id: str, background_tasks: BackgroundTasks):
    # 1. Get the book document
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book or "file_id" not in book:
        raise HTTPException(status_code=404, detail="Book or file not found")
    if book.get("status", "").lower() != "unprocessed":
        raise HTTPException(status_code=400, detail="Book status must be 'unprocessed' to index.")
    
    file_id = book["file_id"]

    # 2. Update book status to 'Indexing'
    books_collection.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {"status": "Indexing"}}
    )

    # 3. Retrieve the file from GridFS and write to a temp file
    file_obj = fs.get(file_id)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_obj.read())
        tmp_path = tmp.name

    # 4. Add background task
    background_tasks.add_task(index, tmp_path, book_id)

    return {
        "message": f"Indexing and classification started for book {book_id}"
    }

@router.get("/", response_model=ChunkListResponse, dependencies=[Depends(get_user_from_cookie)])
def get_all_chunks():
    chunks_collection = get_chunks_collection()
    chunks = list(chunks_collection.find())

    # Convert ObjectId to string
    for chunk in chunks:
        chunk["_id"] = str(chunk["_id"])

    return ChunkListResponse(items=[ChunkResponse(**chunk) for chunk in chunks])

@router.get("/classifications/{book_id}", dependencies=[Depends(get_user_from_cookie)])
def get_book_classifications(book_id: str):
    chunks_collection = get_chunks_collection()

    # Get all chunks for this book_id
    chunks = list(chunks_collection.find({"doc_id": book_id}))

    if not chunks:
        raise HTTPException(status_code=404, detail="No chunks found for this book.")

    classifications = []

    for chunk in chunks:
        if "classification" in chunk and chunk["classification"]:
            for c in chunk["classification"]:
                # Only add the classification string
                if "classification" in c:
                    classifications.append(c["classification"])

    return {"book_id": book_id, "classifications": classifications}


@router.get("/count", dependencies=[Depends(get_user_from_cookie)])
def get_chunks_count():
    chunks_collection = get_chunks_collection()
    count = chunks_collection.count_documents({})
    return {"count": count}

@router.delete("/", dependencies=[Depends(get_user_from_cookie)])
def delete_all_chunks():
    chunks_collection = get_chunks_collection()
    delete_result = chunks_collection.delete_many({})
    return {"message": f"Successfully deleted {delete_result.deleted_count} chunks."}