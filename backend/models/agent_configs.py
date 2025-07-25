from pydantic import BaseModel, Field
from typing import Optional, Literal


class AgentConfigModel(BaseModel):
    id: str = Field(..., alias="_id")  # Map MongoDB _id to string
    agent_name: str
    description: str
    type: Literal["classifcation", "analysis"]
    criteria: Optional[str] = None      
    guidelines: Optional[str] = None    
    status: Optional[bool] = False
    evaluators_prompt: Optional[str] = None
    classifier_prompt: Optional[str] = None

    class Config:
        populate_by_name = True
