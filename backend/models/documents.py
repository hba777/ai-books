from typing import Optional, List
from pydantic import BaseModel, Field

class FeedbackModel(BaseModel):
    user_id: str
    username: str
    department: str
    comment: str
    timestamp: str  # ISO datetime string

class BookModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    doc_id: str
    doc_name: str
    author: str
    date: str
    status: str = "Pending"
    category: str
    reference: str
    summary: str
    labels: Optional[List[str]] = []
    startDate: Optional[str] = None
    endDate: Optional[str] = None

    assigned_departments: List[str] = []         # New field
    feedback: List[FeedbackModel] = []           # New field

    class Config:
        populate_by_name = True


class BookCreate(BaseModel):
    doc_id: Optional[str] = None
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
    assigned_departments: Optional[List[str]] = []  # Allow assignment on creation
