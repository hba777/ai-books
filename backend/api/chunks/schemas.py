from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ClassificationResult(BaseModel):
    classification: str
    confidence_score: int
    criteria_matched: List[str]

class ChunkResponse(BaseModel):
    id: Optional[str] = Field(alias="_id")  # Maps MongoDB's _id to id
    chunk_id: str
    chunk_index: int
    page_number: Optional[int]
    doc_id: str
    status: str
    analysis_status: str
    text: str
    classification: Optional[List[ClassificationResult]] = None

    class Config:
        populate_by_name = True

class ChunkListResponse(BaseModel):
    items: List[ChunkResponse]
