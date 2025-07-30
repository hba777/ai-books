from typing import Optional, List
from pydantic import BaseModel, Field

class FeedbackModel(BaseModel):
    user_id: str
    username: str
    department: str
    comment: str
    timestamp: str  # ISO datetime string

class FeedbackRequest(BaseModel):
    comment: str
    department: str

class BookResponse(BaseModel):
    id: str = Field(alias="_id")       # Internal name `id`, accepts/returns `_id`
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
    assigned_departments: List[str] = []
    feedback: List[FeedbackModel] = []

    class Config:
        populate_by_name = True
        from_attributes = True

class BookDeleteResponse(BaseModel):
    detail: str