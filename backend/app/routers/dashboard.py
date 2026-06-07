from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .schedules import get_todays_schedule
from ..models.task import Task, KanbanStatus
from ..models.course import Course
from ..models.user import User
from .auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = datetime.now()
    todays_schedule = get_todays_schedule(db, today, current_user.id)
    todays_course_ids = {item["schedule"].course_id for item in todays_schedule}

    urgent_tasks = (
        db.query(Task)
        .join(Course)
        .filter(
            Task.user_id == current_user.id,
            Task.deadline <= today + __import__("datetime").timedelta(hours=48),
            Task.kanban_status != KanbanStatus.done,
        )
        .order_by(Task.deadline)
        .limit(5)
        .all()
    )

    courses_count = db.query(Course).filter(Course.user_id == current_user.id).count()
    in_progress_count = db.query(Task).filter(Task.user_id == current_user.id, Task.kanban_status.in_([KanbanStatus.in_progress, KanbanStatus.review])).count()
    done_count = db.query(Task).filter(Task.user_id == current_user.id, Task.kanban_status == KanbanStatus.done).count()

    return {
        "today_schedule": [
            {
                "course_name": item["schedule"].course.name,
                "start_time": item["schedule"].start_time.isoformat(),
                "end_time": item["schedule"].end_time.isoformat(),
                "room": item["schedule"].room,
                "override_status": getattr(item["override"], "status", None) if item["override"] else None,
                "new_start": getattr(item["override"], "new_start_time", None) if item["override"] else None,
            }
            for item in todays_schedule
        ],
        "courses_count": courses_count,
        "in_progress_count": in_progress_count,
        "done_count": done_count,
        "urgent_tasks_count": len(urgent_tasks),
        "urgent_tasks": [
            {
                "id": t.id,
                "title": t.title,
                "course_code": t.course.code,
                "deadline": t.deadline.isoformat(),
            }
            for t in urgent_tasks
        ],
    }