from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Reusable review detail schema
class ReviewDetailModel(BaseModel):
    confidence: int
    human_review: bool
    issue_found: bool
    observation: str
    problematic_text: str
    recommendation: str
    retries: int
    status: str

# Main review outcome model
class ReviewOutcomesModel(BaseModel):
    Book_Name: str = Field(..., alias="Book Name")
    Chunk_no: int = Field(..., alias="Chunk no.")
    Chunk_ID: str = Field(..., alias="Chunk_ID")
    doc_id: str
    FactCheckingReview: ReviewDetailModel
    FederalUnityReview: ReviewDetailModel
    ForeignRelationsReview: ReviewDetailModel
    HistoricalNarrativeReview: ReviewDetailModel
    InstitutionalIntegrityReview: ReviewDetailModel
    NationalSecurityReview: ReviewDetailModel
    overall_status: str
    Page_Number: str = Field(..., alias="Page Number")
    Predicted_Label: str = Field(..., alias="Predicted Label")
    Predicted_Label_Confidence: float = Field(..., alias="Predicted Label Confidence")
    RhetoricToneReview: ReviewDetailModel
    Text_Analyzed: str = Field(..., alias="Text Analyzed")
    timestamp: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()  # Ensure datetime is serialized to ISO string
        }
