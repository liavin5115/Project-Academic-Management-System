from pydantic import BaseModel, Field
from typing import Optional


class LecturerCreate(BaseModel):
    name: str = Field(..., max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    contact: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class LecturerUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    contact: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class LecturerOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    contact: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True