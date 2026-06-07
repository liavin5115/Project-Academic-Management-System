from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Time
from sqlalchemy.orm import relationship
from ..database import Base
import enum


class OverrideStatus(str, enum.Enum):
    cancelled = "cancelled"
    moved = "moved"
    replacement = "replacement"


class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    day_of_week = Column(String(10), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50), nullable=True)
    semester = Column(String(20), nullable=False)

    user = relationship("User", back_populates="schedules")
    course = relationship("Course", back_populates="schedules")
    overrides = relationship("ScheduleOverride", back_populates="schedule", cascade="all, delete-orphan")


class ScheduleOverride(Base):
    __tablename__ = "schedule_override"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedule.id"), nullable=False)
    override_date = Column(DateTime, nullable=False)
    status = Column(Enum(OverrideStatus), nullable=False)
    new_start_time = Column(Time, nullable=True)
    new_end_time = Column(Time, nullable=True)
    note = Column(String(255), nullable=True)

    schedule = relationship("Schedule", back_populates="overrides")