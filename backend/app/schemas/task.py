from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class KanbanStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class TaskCreate(BaseModel):
    course_id: int
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    deadline: datetime
    difficulty: int = Field(..., ge=1, le=5)


class TaskUpdate(BaseModel):
    course_id: Optional[int] = None
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    difficulty: Optional[int] = Field(None, ge=1, le=5)
    status: Optional[str] = None
    kanban_status: Optional[KanbanStatus] = None


class TaskOut(BaseModel):
    id: int
    course_id: int
    course_name: str
    title: str
    description: Optional[str]
    deadline: datetime
    difficulty: int
    priority_score: Optional[float]
    status: str
    kanban_status: KanbanStatus
    position: int

    class Config:
        from_attributes = True


class TaskReorderItem(BaseModel):
    id: int
    kanban_status: KanbanStatus
    position: int


class TaskReorder(BaseModel):
    tasks: list[TaskReorderItem]