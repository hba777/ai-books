from pydantic import BaseModel, Field
from typing import Optional

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    username: str
    password: str
    token: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            # Add custom encoders if needed
        } 