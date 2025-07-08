from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    id: Optional[str]
    username: str
    role: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    id: str
    username: str
    token: str 
    role: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"