from pydantic import BaseModel, Field
from typing import Optional
from datetime import time, datetime
from enum import Enum


class OverrideStatus(str, Enum):
    cancelled = "cancelled"
    moved = "moved"
    replacement = "replacement"


class ScheduleCreate(BaseModel):
    course_id: int
    day_of_week: str = Field(..., max_length=10)
    start_time: time
    end_time: time
    room: Optional[str] = Field(None, max_length=50)
    semester: str = Field(..., max_length=20)


class ScheduleUpdate(BaseModel):
    day_of_week: Optional[str] = Field(None, max_length=10)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = Field(None, max_length=50)
    semester: Optional[str] = Field(None, max_length=20)


class ScheduleOut(BaseModel):
    id: int
    course_id: int
    course_name: str
    day_of_week: str
    start_time: Optional[time]
    end_time: Optional[time]
    room: Optional[str]
    semester: str

    class Config:
        from_attributes = True


class ScheduleOverrideCreate(BaseModel):
    schedule_id: int
    override_date: datetime
    status: OverrideStatus
    new_start_time: Optional[time] = None
    new_end_time: Optional[time] = None
    note: Optional[str] = Field(None, max_length=255)


class ScheduleOverrideUpdate(BaseModel):
    override_date: Optional[datetime] = None
    status: Optional[OverrideStatus] = None
    new_start_time: Optional[time] = None
    new_end_time: Optional[time] = None
    note: Optional[str] = Field(None, max_length=255)


class ScheduleOverrideOut(BaseModel):
    id: int
    schedule_id: int
    override_date: datetime
    status: OverrideStatus
    new_start_time: Optional[time]
    new_end_time: Optional[time]
    note: Optional[str]

    class Config:
        from_attributes = True