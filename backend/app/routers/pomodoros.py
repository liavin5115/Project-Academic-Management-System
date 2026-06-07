from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.pomodoro import PomodoroSession
from ..models.user import User
from ..schemas.pomodoro import PomodoroCreate, PomodoroOut
from .auth import get_current_user

router = APIRouter()

@router.get("/pomodoros", response_model=List[PomodoroOut])
def list_pomodoros(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(PomodoroSession).filter(PomodoroSession.user_id == current_user.id).order_by(PomodoroSession.completed_at.desc()).all()
    return sessions

@router.post("/pomodoros", response_model=PomodoroOut)
def log_pomodoro(payload: PomodoroCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = PomodoroSession(user_id=current_user.id, duration_minutes=payload.duration_minutes, course_id=payload.course_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
