from pydantic import BaseModel, Field

class BookResponse(BaseModel):
    id: str = Field(..., alias="_id")  # Return _id for frontend
    doc_id: str
    doc_name: str
    status: str
    summary: str

    class Config:
        populate_by_name = True
