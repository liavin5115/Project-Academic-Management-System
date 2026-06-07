from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Material(Base):
    __tablename__ = "material"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False)
    title = Column(String(200), nullable=False)
    session_number = Column(Integer, nullable=True)
    drive_link = Column(String(500), nullable=True)
    type = Column(String(20), nullable=False)

    user = relationship("User", back_populates="materials")
    course = relationship("Course", back_populates="materials")