from pydantic import BaseModel, Field

class ChunkModel(BaseModel):
    analysis_status: str
    chunk_id: str
    chunk_index: int
    doc_id: str
    status: str
    text: str

    class Config:
        populate_by_name = True  # Allows using 'id' or '_id'
