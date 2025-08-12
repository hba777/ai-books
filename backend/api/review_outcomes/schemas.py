from pydantic import BaseModel, Field
from typing import Optional

class ReviewUpdateRequest(BaseModel):
    observation: Optional[str] = Field(None, description="New observation text for this review type.")
    recommendation: Optional[str] = Field(None, description="New recommendation text for this review type.")

    class Config:
        json_schema_extra = {
            "example": {
                "observation": "Revised observation about Pakistan's role.",
                "recommendation": "Fact-check sources before finalizing."
            }
        }
