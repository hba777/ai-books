from fastapi import APIRouter, Depends, Body, HTTPException
from typing import List
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_review_outcomes_collection
from Analysis.mains1 import run_workflow
from .schemas import ReviewUpdateRequest
import json
from bson.json_util import dumps
from bson import ObjectId

router = APIRouter(prefix="/review_outcomes", tags=["Review Outcomes"])

@router.get("/", dependencies=[Depends(get_user_from_cookie)])
def get_all_review_outcomes():
    review_outcomes_collection = get_review_outcomes_collection()
    review_outcomes = list(review_outcomes_collection.find())
    return json.loads(dumps(review_outcomes))

@router.get("/count", dependencies=[Depends(get_user_from_cookie)])
def get_review_outcomes_count():
    review_outcomes_collection = get_review_outcomes_collection()
    count = review_outcomes_collection.count_documents({})
    return {"count": count}

@router.delete("/delete_all", dependencies=[Depends(get_user_from_cookie)])
def delete_all_review_outcomes():
    """
    Deletes all review outcomes from the collection.
    """
    review_outcomes_collection = get_review_outcomes_collection()
    result = review_outcomes_collection.delete_many({})
    return {"status": "success", "deleted_count": result.deleted_count}

# Analysis Workflow
# @router.post("/run", dependencies=[Depends(get_user_from_cookie)])
# def run_analysis_workflow():
#     """
#     Calls the run_workflow function from Analysis.mains1 and returns its result.
#     """
#     try:
#         result = run_workflow()  # Pass params if needed
#         return {"status": "success", "result": result}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}

@router.put("/update/{outcome_id}/{review_type}", dependencies=[Depends(get_user_from_cookie)])
def update_review_type(
    outcome_id: str,
    review_type: str,
    data: ReviewUpdateRequest = Body(...)
):
    """
    Updates the observation and recommendation fields for a specific review type
    inside a review outcome document.
    """
    review_outcomes_collection = get_review_outcomes_collection()

    # Extract fields from Pydantic model
    observation = data.observation
    recommendation = data.recommendation

    if observation is None and recommendation is None:
        raise HTTPException(status_code=400, detail="Must provide observation or recommendation to update.")

    # Build update document with dot notation
    update_fields = {}
    if observation is not None:
        update_fields[f"{review_type}.observation"] = observation
    if recommendation is not None:
        update_fields[f"{review_type}.recommendation"] = recommendation

    # Perform update
    result = review_outcomes_collection.update_one(
        {"_id": ObjectId(outcome_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review outcome or review type not found.")

    return {
        "status": "success",
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
        "updated_fields": update_fields
    }

@router.delete("/delete/{outcome_id}/{review_type}", dependencies=[Depends(get_user_from_cookie)])
def delete_review_type(outcome_id: str, review_type: str):
    """
    Deletes a specific review type from a review outcome document.
    """
    review_outcomes_collection = get_review_outcomes_collection()

    # Use $unset to remove the specific review type field
    result = review_outcomes_collection.update_one(
        {"_id": ObjectId(outcome_id)},
        {"$unset": {review_type: ""}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review outcome not found.")

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Review type not found in this outcome.")

    return {
        "status": "success",
        "matched_count": result.matched_count,
        "modified_count": result.modified_count,
        "deleted_review_type": review_type,
        "outcome_id": outcome_id
    }

