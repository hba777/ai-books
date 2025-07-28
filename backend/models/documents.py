from typing import Optional, List
from pydantic import BaseModel, Field

class BookModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # MongoDB _id as string
    doc_id: str                                 # Will store same value as _id
    doc_name: str                               # corresponds to title in frontend
    author: str
    date: str                                   
    status: str = "Pending"                     # Default status. Pending, In Progress, Completed, Assigned, Classified
    category: str
    reference: str
    summary: str                                # Can store abstract_summary
    labels: Optional[List[str]] = []            # Tags or topics
    startDate: Optional[str] = None             
    endDate: Optional[str] = None               

    class Config:
        populate_by_name = True


# Input Schema (for creating books)
class BookCreate(BaseModel):
    doc_id: Optional[str] = None  # Optional on creation; will be set to _id later
    doc_name: str
    author: str
    date: Optional[str] = None
    status: str = "Pending"
    category: str
    reference: str
    summary: str
    labels: Optional[List[str]] = []
    startDate: Optional[str] = None
    endDate: Optional[str] = None
