from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from ..database import Base

def get_gmt7_time():
    return datetime.utcnow() + timedelta(hours=7)

class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=True)
    duration_minutes = Column(Integer, default=25)
    completed_at = Column(DateTime, default=get_gmt7_time)

    user = relationship("User", back_populates="pomodoros")
    course = relationship("Course", back_populates="pomodoros")
