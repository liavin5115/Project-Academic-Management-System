from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Lecturer(Base):
    __tablename__ = "lecturer"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    contact = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    course_lecturers = relationship("CourseLecturer", back_populates="lecturer", cascade="all, delete-orphan")


class CourseLecturer(Base):
    __tablename__ = "course_lecturer"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    lecturer_id = Column(Integer, ForeignKey("lecturer.id"), nullable=False)
    role = Column(String(50), nullable=True)

    course = relationship("Course", back_populates="course_lecturers")
    lecturer = relationship("Lecturer", back_populates="course_lecturers")