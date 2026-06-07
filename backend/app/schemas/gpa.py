from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class GPAReportCreate(BaseModel):
    semester_name: str = Field(..., max_length=100)
    total_credits: int = Field(..., ge=0)
    gpa: float = Field(..., ge=0, le=4.0)

class GPAReportOut(BaseModel):
    id: int
    user_id: int
    semester_name: str
    total_credits: int
    gpa: float
    created_at: datetime

    class Config:
        from_attributes = True
