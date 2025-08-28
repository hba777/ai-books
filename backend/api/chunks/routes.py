from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_chunks_collection, books_collection, fs
from .schemas import ChunkResponse, ChunkListResponse, IndexBookRequest
import tempfile
from bson import ObjectId
from Classification.index_document import index


router = APIRouter(prefix="/chunks", tags=["Chunks"])

done = []



@router.get("/test-model")
def test_model_load():
    """Try to query the LLM; return 200 if ok, 500 if it fails."""
    from Classification.models import LLAMA
    try:
        # Run a lightweight inference
        resp = LLAMA.invoke("ping")
        if resp and hasattr(resp, "content"):
            return {"status": "ok", "response": resp.content}
        else:
            raise RuntimeError("Model responded unexpectedly")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model load failed: {e}")

@router.post("/index-book/{book_id}")
def index_book(book_id: str, request: IndexBookRequest, background_tasks: BackgroundTasks):
    # 1. Get the book document
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book or "file_id" not in book:
        raise HTTPException(status_code=404, detail="Book or file not found")
    if book.get("status", "").lower() != "unprocessed":
        raise HTTPException(status_code=400, detail="Book status must be 'unprocessed' to index.")
    
    file_id = book["file_id"]

    # 2. Update book status to 'Indexing' and store previous status in lastFinalstatus
    previous_status = book.get("status")
    books_collection.update_one(
        {"_id": ObjectId(book_id)},
        {"$set": {"status": "Indexing", "lastFinalstatus": previous_status}}
    )

    # 3. Retrieve the file from GridFS and write to a temp file
    file_obj = fs.get(file_id)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_obj.read())
        tmp_path = tmp.name

    # 4. Add background task with error handling and chunk_size
    def _task():
        try:
            index(tmp_path, book_id, request.chunk_size)
        except Exception as e:
            # Revert status to lastFinalstatus on error
            current = books_collection.find_one({"_id": ObjectId(book_id)}) or {}
            fallback_status = current.get("lastFinalstatus") or previous_status or "Unprocessed"
            books_collection.update_one(
                {"_id": ObjectId(book_id)},
                {"$set": {"status": fallback_status}}
            )
            raise e

    background_tasks.add_task(_task)

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

