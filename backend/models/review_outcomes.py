from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class ReviewDetailModel(BaseModel):
    confidence: int
    human_review: bool
    issue_found: bool
    observation: str
    problematic_text: str
    recommendation: str
    retries: int
    status: str

class ReviewOutcomesModel(BaseModel):
    _id: PyObjectId = Field(..., alias="_id")
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
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}