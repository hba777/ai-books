from pydantic import BaseModel, Field
from typing import Optional, Literal, List


class KnowledgeBaseItem(BaseModel):
    id: str = Field(..., alias="_id")  # MongoDB _id as string
    json_data: str
    main_category: str
    sub_category: Optional[str] = None
    topic: str

    class Config:
        populate_by_name = True  # Allows use of 'id' or '_id'


class AgentConfigModel(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # Map MongoDB _id to string
    agent_name: str
    type: Literal["classification", "analysis"]
    criteria: Optional[str] = None      
    guidelines: Optional[str] = None    
    status: Optional[bool] = False
    evaluators_prompt: Optional[str] = None
    classifier_prompt: Optional[str] = None
    knowledge_base: Optional[List[KnowledgeBaseItem]] = None
    

    class Config:
        populate_by_name = True
