from typing import List, Optional
from pydantic import BaseModel, Field

class AgentConfigResponse(BaseModel):
    _id: str = Field(..., alias="_id")
    agent_name: str
    criteria: str
    guidelines: str

class AgentConfigListResponse(BaseModel):
    agents: List[AgentConfigResponse]

class AgentDeleteResponse(BaseModel):
    detail: str