from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
import enum


class TaskStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"


class KanbanStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=False)
    difficulty = Column(Integer, nullable=False)
    priority_score = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    kanban_status = Column(Enum(KanbanStatus), nullable=False, default=KanbanStatus.todo)
    position = Column(Integer, nullable=False, default=0)

    user = relationship("User", back_populates="tasks")
    course = relationship("Course", back_populates="tasks")