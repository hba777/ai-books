# backend/api/chunks/schemas.py
from pydantic import BaseModel, Field
from typing import List

class ChunkResponse(BaseModel):
    id: str = Field(..., alias="_id")  # MongoDB _id as string
    analysis_status: str
    chunk_id: str
    chunk_index: int
    doc_id: str
    status: str
    text: str

    class Config:
        populate_by_name = True  # Allows using 'id' or '_id'


class ChunkListResponse(BaseModel):
    items: List[ChunkResponse]
