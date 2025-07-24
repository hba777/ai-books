from pydantic import BaseModel, Field

class AgentConfigModel(BaseModel):
    id: str = Field(..., alias="_id")  # Map MongoDB _id to string
    agent_name: str
    criteria: str
    guidelines: str

    class Config:
        populate_by_name = True  # Allows '_id' or 'id'
