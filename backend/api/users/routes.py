from fastapi import APIRouter, HTTPException, Path, Depends
from models.user import User, UserCreate
from api.users.users_response_schemas import UserResponse, LoginRequest, LoginResponse, RegisterRequest
from utils.jwt_utils import create_access_token, get_current_user, is_admin
from db.mongo import get_users_collection
from passlib.context import CryptContext
from pydantic import BaseModel
from bson import ObjectId
from typing import List
import bcrypt
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=UserResponse, dependencies=[Depends(is_admin)])
def register_user(request: UserCreate):
    users_collection = get_users_collection()
    if users_collection.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    role = request.role if request.role else "user"
    user = UserCreate(username=request.username, password=hashed_password, role=role)
    result = users_collection.insert_one(user.dict())
    db_user = users_collection.find_one({"_id": result.inserted_id})
    token = create_access_token(str(db_user["_id"]), db_user["username"], db_user["role"])
    users_collection.update_one({"_id": result.inserted_id}, {"$set": {"token": token}})
    return UserResponse(id=str(db_user["_id"]), username=db_user["username"], role=db_user["role"])

@router.post("/login", response_model=LoginResponse)
def login_user(request: LoginRequest):
    users_collection = get_users_collection()
    user_data = users_collection.find_one({"username": request.username})
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not bcrypt.checkpw(request.password.encode("utf-8"), user_data["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(str(user_data["_id"]), user_data["username"], user_data["role"])
    users_collection.update_one({"_id": user_data["_id"]}, {"$set": {"token": token}})
    return LoginResponse(id=str(user_data["_id"]), username=user_data["username"], token=token, role=user_data["role"])

@router.post("/token", response_model=LoginResponse)
def login_token(form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = get_users_collection()
    user_data = users_collection.find_one({"username": form_data.username})
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not bcrypt.checkpw(form_data.password.encode("utf-8"), user_data["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(str(user_data["_id"]), user_data["username"], user_data["role"])
    users_collection.update_one({"_id": user_data["_id"]}, {"$set": {"token": token}})
    return LoginResponse(id=str(user_data["_id"]), username=user_data["username"], token=token, role=user_data["role"])

@router.get("/all", response_model=List[UserResponse], dependencies=[Depends(is_admin)])
def get_all_users():
    users_collection = get_users_collection()
    users = users_collection.find()
    return [UserResponse(id=str(user["_id"]), username=user["username"], role=user["role"]) for user in users]

@router.delete("/{user_id}", dependencies=[Depends(is_admin)])
def delete_user(user_id: str = Path(..., description="The ID of the user to delete")):
    users_collection = get_users_collection()
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    result = users_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"} 