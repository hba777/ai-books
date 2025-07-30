from pydantic import BaseModel, Field
from typing import Optional

class KnowledgeBaseModel(BaseModel):
    id: str = Field(default=None, alias="_id")  # MongoDB _id as string
    json_data: str
    main_category: str
    sub_category: Optional[str] = None
    topic: str

    class Config:
        populate_by_name = True  # Allows use of 'id' or '_id'
