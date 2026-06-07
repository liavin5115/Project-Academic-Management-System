from pydantic import BaseModel, Field
from typing import Optional


class MaterialCreate(BaseModel):
    course_id: int
    title: str = Field(..., max_length=200)
    session_number: Optional[int] = None
    drive_link: Optional[str] = Field(None, max_length=500)
    type: str = Field(..., max_length=20)


class MaterialUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    session_number: Optional[int] = None
    drive_link: Optional[str] = Field(None, max_length=500)
    type: Optional[str] = Field(None, max_length=20)


class MaterialOut(BaseModel):
    id: int
    course_id: int
    course_name: str
    title: str
    session_number: Optional[int]
    drive_link: Optional[str]
    type: str

    class Config:
        from_attributes = True