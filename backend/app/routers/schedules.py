from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.schedule import Schedule, ScheduleOverride
from ..models.course import Course
from ..models.user import User
from ..schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleOut
from .auth import get_current_user

router = APIRouter()

@router.get("/schedules", response_model=List[ScheduleOut])
def list_schedules(day: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Schedule).filter(Schedule.user_id == current_user.id)
    if day:
        query = query.filter(Schedule.day_of_week == day)
    return [
        ScheduleOut(
            id=s.id,
            course_id=s.course_id,
            course_name=s.course.name if s.course else "",
            day_of_week=s.day_of_week,
            start_time=s.start_time,
            end_time=s.end_time,
            room=s.room,
            semester=s.semester,
        )
        for s in query.all()
    ]

@router.post("/schedules", response_model=ScheduleOut)
def create_schedule(payload: ScheduleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Invalid course_id or course does not belong to user")
        
    schedule = Schedule(**payload.model_dump(), user_id=current_user.id)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return ScheduleOut(**payload.model_dump(), id=schedule.id, course_name="")

@router.put("/schedules/{schedule_id}", response_model=ScheduleOut)
def update_schedule(schedule_id: int, payload: ScheduleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.user_id == current_user.id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    if payload.course_id:
        course = db.query(Course).filter(Course.id == payload.course_id, Course.user_id == current_user.id).first()
        if not course:
            raise HTTPException(status_code=400, detail="Invalid course_id or course does not belong to user")
            
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(schedule, key, value)
    db.commit()
    db.refresh(schedule)
    return ScheduleOut(
        id=schedule.id,
        course_id=schedule.course_id,
        course_name=schedule.course.name if schedule.course else "",
        day_of_week=schedule.day_of_week,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        room=schedule.room,
        semester=schedule.semester,
    )

@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    schedule = db.query(Schedule).filter(Schedule.id == schedule_id, Schedule.user_id == current_user.id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"detail": "Schedule deleted"}

def get_todays_schedule(db: Session, target_date: datetime, user_id: int):
    day_name = target_date.strftime("%A")
    schedules = db.query(Schedule).filter(Schedule.day_of_week == day_name, Schedule.user_id == user_id).all()
    result = []
    for s in schedules:
        override = (
            db.query(ScheduleOverride)
            .filter(ScheduleOverride.schedule_id == s.id, ScheduleOverride.override_date == target_date.date())
            .first()
        )
        result.append({"schedule": s, "override": override})
    return result