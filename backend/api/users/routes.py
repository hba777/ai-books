from fastapi import APIRouter, HTTPException
from models.user import User
from api.users.users_response_schemas import UserResponse, LoginRequest, LoginResponse, RegisterRequest
from utils.jwt_utils import create_access_token
from db.mongo import get_users_collection
from passlib.context import CryptContext
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register", response_model=UserResponse)
def register_user(request: RegisterRequest):
    users_collection = get_users_collection()
    if users_collection.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = pwd_context.hash(request.password)
    user = User(username=request.username, password=hashed_password)
    user_dict = user.dict(by_alias=True)
    result = users_collection.insert_one(user_dict)
    # Fetch the inserted user and convert _id to str
    db_user = users_collection.find_one({"_id": result.inserted_id})
    token = create_access_token({"user_id": str(db_user["_id"]), "username": db_user["username"]})
    users_collection.update_one({"_id": result.inserted_id}, {"$set": {"token": token}})
    return UserResponse(id=str(db_user["_id"]), username=db_user["username"])

@router.post("/login", response_model=LoginResponse)
def login_user(request: LoginRequest):
    users_collection = get_users_collection()
    user_data = users_collection.find_one({"username": request.username})
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not pwd_context.verify(request.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"user_id": str(user_data["_id"]), "username": user_data["username"]})
    users_collection.update_one({"_id": user_data["_id"]}, {"$set": {"token": token}})
    return LoginResponse(id=str(user_data["_id"]), username=user_data["username"], token=token) 