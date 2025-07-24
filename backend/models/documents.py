from typing import Optional
from pydantic import BaseModel, Field

class BookModel(BaseModel):
    id: str = Field(default=None, alias="_id")  # _id as string for MongoDB
    doc_id: str
    doc_name: str
    status: str  # Pending, In Progress, Completed
    summary: str

    class Config:
        populate_by_name = True



# Input Schema (for creating books)
class BookCreate(BaseModel):
    doc_id: str
    doc_name: str
    status: str
    summary: str

