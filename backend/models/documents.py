from typing import Optional, List
from pydantic import BaseModel, Field

class FeedbackModel(BaseModel):
    user_id: str
    username: str
    department: str
    comment: str
    timestamp: str  # ISO datetime string

class ClassificationFilters(BaseModel):
    # maps classification name -> integer
    name: str
    value: int

class FiltersModel(BaseModel):
    classificationFilters: Optional[List[ClassificationFilters]] = []
    analysisFilters: Optional[List[str]] = []

class BookModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    doc_id: Optional[str] = None
    doc_name: Optional[str] = None
    author: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = "Pending"
    category: Optional[str] = None
    reference: Optional[str] = None
    summary: Optional[str] = None
    labels: Optional[List[str]] = []
    startDate: Optional[str] = None
    endDate: Optional[str] = None

    assigned_departments: Optional[List[str]] = []
    feedback: Optional[List["FeedbackModel"]] = []

    # ✅ New filters class
    filters: Optional[FiltersModel] = FiltersModel()

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
