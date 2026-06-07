from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from .services.notification import send_notification
from .database import SessionLocal
from .models.schedule import Schedule, ScheduleOverride
from .models.task import Task, KanbanStatus
from .services.priority import calculate_priority_score
from .config import settings


def send_daily_briefing():
    db = SessionLocal()
    try:
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
                Task.deadline <= today + __import__("datetime").timedelta(hours=24),
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

        send_notification(message)
    finally:
        db.close()


def recalculate_priority_scores():
    db = SessionLocal()
    try:
        tasks = db.query(Task).all()
        for task in tasks:
            task.priority_score = calculate_priority_score(task.deadline, task.difficulty)
        db.commit()
    finally:
        db.close()


scheduler = BackgroundScheduler()


def start_scheduler():
    scheduler.add_job(
        send_daily_briefing,
        CronTrigger(hour=6, minute=0, timezone=settings.timezone),
        id="daily_briefing",
        replace_existing=True,
    )
    scheduler.add_job(
        recalculate_priority_scores,
        "interval",
        minutes=30,
        id="priority_recalc",
        replace_existing=True,
    )
    scheduler.start()