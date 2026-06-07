from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from ..database import Base

def get_gmt7_time():
    return datetime.utcnow() + timedelta(hours=7)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_gmt7_time)

    courses = relationship("Course", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="user", cascade="all, delete-orphan")
    pomodoros = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")
    gpa_reports = relationship("GPAReport", back_populates="user", cascade="all, delete-orphan")
