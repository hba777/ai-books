from fastapi import APIRouter, status
from db.mongo import get_kb_data_collection
from .schemas import KnowledgeBaseResponse, KnowledgeBaseListResponse

router = APIRouter(prefix="/kb_data", tags=["Knowledge Base Data"])

@router.get(
    "/",
    response_model=KnowledgeBaseListResponse)
def get_all_kb_data():
    collection = get_kb_data_collection()
    items = list(collection.find())
    for item in items:
        item["_id"] = str(item["_id"])
    return KnowledgeBaseListResponse(items=[KnowledgeBaseResponse(**item) for item in items])

@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_all_kb_data():
    collection = get_kb_data_collection()
    # Delete all documents
    collection.delete_many({})
    return {"message": "All knowledge base data deleted successfully"}
