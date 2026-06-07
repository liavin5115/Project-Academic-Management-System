from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models.schedule import Schedule, ScheduleOverride
from ..models.task import Task, KanbanStatus
from ..models.notification_log import NotificationLog
from ..services.notification import send_notification

router = APIRouter()


@router.post("/notifications/send-now")
async def send_now(db: Session = Depends(get_db)):
    today = datetime.now()
    day_name = today.strftime("%A")

    schedules = db.query(Schedule).filter(Schedule.day_of_week == day_name).all()
    schedule_lines = []
    for s in schedules:
        override = (
            db.query(ScheduleOverride)
            .filter(ScheduleOverride.schedule_id == s.id, ScheduleOverride.override_date >= today.date())
            .first()
        )
        if override:
            status_text = f" [{override.status.value}]"
            if override.new_start_time:
                schedule_lines.append(f"- {override.new_start_time} {s.course.name} @ {s.room}{status_text}")
            else:
                schedule_lines.append(f"- {s.course.name} @ {s.room} [cancelled]")
        else:
            schedule_lines.append(f"- {s.start_time} {s.course.name} @ {s.room}")

    urgent = (
        db.query(Task)
        .filter(
            Task.deadline <= today + timedelta(hours=24),
            Task.kanban_status != KanbanStatus.done,
        )
        .all()
    )
    task_lines = [f"- {t.title} ({t.course.name}) — due {t.deadline}" for t in urgent]

    message = f"""Good morning! 🌅 Here's your daily academic briefing:

📚 Today's Classes ({len(schedule_lines)} classes):
{chr(10).join(schedule_lines) if schedule_lines else "- No classes today"}

⚠️ Urgent Tasks (deadline within 24h):
{chr(10).join(task_lines) if task_lines else "- No urgent tasks"}

You've got this! 💪"""

    result = await send_notification(message)
    return {"success": result}


@router.get("/notification-logs")
def get_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(NotificationLog).order_by(NotificationLog.sent_at.desc()).limit(limit).all()