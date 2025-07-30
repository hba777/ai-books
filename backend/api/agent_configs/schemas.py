from typing import List, Optional
from pydantic import BaseModel, Field


class KnowledgeBaseItemResponse(BaseModel):
    id: str = Field(..., alias="_id")
    json_data: str
    main_category: str
    sub_category: Optional[str] = None
    topic: str

    class Config:
        populate_by_name = True


class AgentConfigResponse(BaseModel):
    id: str = Field(..., alias="_id")
    agent_name: str
    type: str
    criteria: Optional[str] = None
    guidelines: Optional[str] = None
    status: Optional[bool] = False
    evaluators_prompt: Optional[str] = None
    classifier_prompt: Optional[str] = None
    knowledge_base: Optional[List[KnowledgeBaseItemResponse]] = None

class AgentConfigListResponse(BaseModel):
    agents: List[AgentConfigResponse]

class AgentDeleteResponse(BaseModel):
    detail: str