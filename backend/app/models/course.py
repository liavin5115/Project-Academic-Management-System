from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Course(Base):
    __tablename__ = "course"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(20), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    grade = Column(String(5), nullable=True)

    user = relationship("User", back_populates="courses")
    schedules = relationship("Schedule", back_populates="course", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="course", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="course", cascade="all, delete-orphan")
    course_lecturers = relationship("CourseLecturer", back_populates="course", cascade="all, delete-orphan")
    pomodoros = relationship("PomodoroSession", back_populates="course", cascade="all, delete-orphan")