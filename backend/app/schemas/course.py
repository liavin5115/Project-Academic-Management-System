from pydantic import BaseModel, Field
from typing import Optional, List


class CourseCreate(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=100)
    credits: int = Field(..., ge=1, le=6)
    description: Optional[str] = None
    grade: Optional[str] = None


class CourseUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=20)
    name: Optional[str] = Field(None, max_length=100)
    credits: Optional[int] = Field(None, ge=1, le=6)
    description: Optional[str] = None
    grade: Optional[str] = None


class CourseOut(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    description: Optional[str]
    grade: Optional[str] = None
    lecturer_count: int = 0

    class Config:
        from_attributes = True