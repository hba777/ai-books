from typing import List, Optional
from pydantic import BaseModel, Field

class KnowledgeBaseResponse(BaseModel):
    _id: str = Field(..., alias="_id")
    json_data: str
    main_category: str
    sub_category: Optional[str] = None
    topic: str

class KnowledgeBaseListResponse(BaseModel):
    items: List[KnowledgeBaseResponse]