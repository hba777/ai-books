from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any

class ClassificationResult(BaseModel):
    classification: Optional[str] = None
    confidence_score: Optional[int] = None
    criteria_matched: Optional[Any] = None
    name: Optional[str] = None

class ChunkResponse(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # Maps MongoDB's _id to id
    chunk_id: Optional[str] = None
    chunk_index: Optional[int] = None
    page_number: Optional[int] = None
    doc_id: Optional[str] = None
    status: Optional[str] = None
    analysis_status: Optional[str] = None
    text: Optional[str] = None
    classification: Optional[List["ClassificationResult"]] = None
    coordinates: Optional[List[int]] = None

    class Config:
        populate_by_name = True

class ChunkListResponse(BaseModel):
    items: List[ChunkResponse]
