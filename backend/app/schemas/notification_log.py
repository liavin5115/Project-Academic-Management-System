from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationLogOut(BaseModel):
    id: int
    task_id: Optional[int]
    sent_at: datetime
    channel: str
    message: str
    success: bool

    class Config:
        from_attributes = True