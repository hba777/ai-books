from typing import Optional, List
from pydantic import BaseModel, Field

class FeedbackModel(BaseModel):
    user_id: str
    username: str
    department: str
    comment: Optional[str] = None
    image_url: Optional[str] = None
    timestamp: str  # ISO datetime string

class FeedbackRequest(BaseModel):
    comment: Optional[str] = None
    department: str
    image: Optional[str] = None  # Base64 encoded image

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

class BookUpdateRequest(BaseModel):
    doc_name: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    reference: Optional[str] = None
    summary: Optional[str] = None
    labels: Optional[List[str]] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None