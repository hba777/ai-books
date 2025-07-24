from fastapi import APIRouter, Depends
from typing import List
from backend.models.review_outcomes import ReviewOutcomesModel
from backend.utils.jwt_utils import get_user_from_cookie
from backend.db.mongo import get_review_outcomes_collection

router = APIRouter()

@router.get("/review_outcomes", response_model=List[ReviewOutcomesModel], dependencies=[Depends(get_user_from_cookie)])
def get_all_review_outcomes():
    review_outcomes_collection = get_review_outcomes_collection()
    review_outcomes = list(review_outcomes_collection.find())
    return review_outcomes

@router.get("/review_outcomes/count", dependencies=[Depends(get_user_from_cookie)])
def get_review_outcomes_count():
    review_outcomes_collection = get_review_outcomes_collection()
    count = review_outcomes_collection.count_documents({})
    return {"count": count}