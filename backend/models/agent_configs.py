from pydantic import BaseModel, Field
from typing import Optional, Literal, List


class KnowledgeBaseItem(BaseModel):
    json_data: str
    main_category: str
    sub_category: Optional[str] = None
    topic: str

    class Config:
        populate_by_name = True  # Allows use of 'id' or '_id'

class ClassifierConfig(BaseModel):
    content_indicators: str
    authorship_indicators: str
    
class AgentConfigModel(BaseModel):
    agent_name: str
    type: Literal["classification", "analysis"]
    criteria: Optional[str] = None      
    guidelines: Optional[str] = None    
    status: Optional[bool] = False
    evaluators_prompt: Optional[str] = None
    classifier_prompt: Optional[ClassifierConfig] = None
    knowledge_base: Optional[List[KnowledgeBaseItem]] = None
    confidence_score: Optional[int] = 80  

    class Config:
        populate_by_name = True
