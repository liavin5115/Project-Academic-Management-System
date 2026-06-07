from sqlalchemy import Column, Integer, DateTime, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class NotificationLog(Base):
    __tablename__ = "notification_log"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("task.id"), nullable=True)
    sent_at = Column(DateTime, nullable=False)
    channel = Column(String(20), nullable=False)
    message = Column(String, nullable=False)
    success = Column(Boolean, nullable=False)

    task = relationship("Task")