from fastapi import APIRouter
from backend.db.mongo import get_kb_data_collection
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