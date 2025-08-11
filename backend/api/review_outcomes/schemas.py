from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Reusable review detail schema for response
class ReviewDetailResponse(BaseModel):
    confidence: Optional[int] = None
    human_review: Optional[bool] = None
    issue_found: Optional[bool] = None
    observation: Optional[str] = None
    problematic_text: Optional[str] = None
    recommendation: Optional[str] = None
    retries: Optional[int] = None
    status: Optional[str] = None

# Main review outcome response schema
class ReviewOutcomesResponse(BaseModel):
    Book_Name: Optional[str] = Field(None, alias="Book Name")
    Chunk_no: Optional[int] = Field(None, alias="Chunk no.")
    Chunk_ID: Optional[str] = Field(None, alias="Chunk_ID")
    doc_id: Optional[str] = None

    FactCheckingReview: Optional[ReviewDetailResponse] = None
    FederalUnityReview: Optional[ReviewDetailResponse] = None
    ForeignRelationsReview: Optional[ReviewDetailResponse] = None
    HistoricalNarrativeReview: Optional[ReviewDetailResponse] = None
    InstitutionalIntegrityReview: Optional[ReviewDetailResponse] = None
    NationalSecurityReview: Optional[ReviewDetailResponse] = None
    RhetoricToneReview: Optional[ReviewDetailResponse] = None

    overall_status: Optional[str] = None
    Page_Number: Optional[str] = Field(None, alias="Page Number")
    Predicted_Label: Optional[str] = Field(None, alias="Predicted Label")
    Predicted_Label_Confidence: Optional[float] = Field(None, alias="Predicted Label Confidence")
    Text_Analyzed: Optional[str] = Field(None, alias="Text Analyzed")
    timestamp: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

# If your endpoint returns multiple records
ReviewOutcomesListResponse = List[ReviewOutcomesResponse]
