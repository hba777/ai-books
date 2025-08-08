from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ClassificationResult(BaseModel):
    classification: str
    confidence_score: int
    criteria_matched: Any
    name: str

class ChunkModel(BaseModel):
    id: Optional[str] = Field(alias="_id")  # Maps MongoDB's _id to id
    chunk_id: str
    chunk_index: int
    doc_id: str
    status: str
    analysis_status: str
    text: str
    classification: Optional[List[ClassificationResult]] = None

    class Config:
        populate_by_name = True