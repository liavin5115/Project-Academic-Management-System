from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime, timedelta

def get_gmt7_time():
    return datetime.utcnow() + timedelta(hours=7)

class GPAReport(Base):
    __tablename__ = "gpa_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    semester_name = Column(String(100), nullable=False)
    total_credits = Column(Integer, nullable=False)
    gpa = Column(Float, nullable=False)
    created_at = Column(DateTime, default=get_gmt7_time)

    user = relationship("User", back_populates="gpa_reports")
