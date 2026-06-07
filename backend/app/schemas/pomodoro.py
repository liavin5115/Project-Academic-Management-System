from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PomodoroCreate(BaseModel):
    duration_minutes: int = 25
    course_id: Optional[int] = None

class PomodoroOut(BaseModel):
    id: int
    user_id: int
    course_id: Optional[int] = None
    duration_minutes: int
    completed_at: datetime

    class Config:
        from_attributes = True
