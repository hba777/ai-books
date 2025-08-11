from fastapi import APIRouter, Depends
from typing import List
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_review_outcomes_collection
from Analysis.mains1 import run_workflow
from .schemas import ReviewOutcomesResponse  # <-- response-friendly model

router = APIRouter(prefix="/review_outcomes", tags=["Review Outcomes"])

@router.get("/", response_model=List[ReviewOutcomesResponse], dependencies=[Depends(get_user_from_cookie)])
def get_all_review_outcomes():
    review_outcomes_collection = get_review_outcomes_collection()
    review_outcomes = list(review_outcomes_collection.find())
    return review_outcomes

@router.get("/count", dependencies=[Depends(get_user_from_cookie)])
def get_review_outcomes_count():
    review_outcomes_collection = get_review_outcomes_collection()
    count = review_outcomes_collection.count_documents({})
    return {"count": count}

# Analysis Workflow
@router.post("/run", dependencies=[Depends(get_user_from_cookie)])
def run_analysis_workflow():
    """
    Calls the run_workflow function from Analysis.mains1 and returns its result.
    """
    try:
        result = run_workflow()  # Pass params if needed
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
