from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: Optional[str]
    username: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    id: str
    username: str
    token: str 

class RegisterRequest(BaseModel):
    username: str
    password: str