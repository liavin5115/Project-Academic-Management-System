from datetime import datetime, time, timedelta
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load the environment variables from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from app.database import SessionLocal, engine, Base
from app.models import Course, Lecturer, CourseLecturer, Schedule, Task, Material, User
from app.models.task import KanbanStatus

# Auto-create tables for SQLite / Local Dev if not already created
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed Users
admin_password_hash = pwd_context.hash("admin123")
test_password_hash = pwd_context.hash("test1234")

users = [
    User(username="admin", email="admin@ams.com", password_hash=admin_password_hash, is_admin=True),
    User(username="testuser", email="test@ams.com", password_hash=test_password_hash, is_admin=False),
]
for u in users:
    db.add(u)
db.commit()

# Seed courses for admin
courses = [
    Course(user_id=1, code="CS101", name="Introduction to Programming", credits=3, description="Basic programming concepts"),
    Course(user_id=1, code="MATH201", name="Linear Algebra", credits=4, description="Vectors and matrices"),
    Course(user_id=1, code="ENG102", name="Technical Writing", credits=2, description="Writing for engineers"),
]
for c in courses:
    db.add(c)
db.commit()

# Seed lecturers
lecturers = [
    Lecturer(name="Dr. Alice Smith", email="alice@univ.edu", contact="555-1234", notes="Clear explanations, strict attendance"),
    Lecturer(name="Prof. Bob Johnson", email="bob@univ.edu", contact="555-5678", notes="Humorous, practical examples"),
]
for l in lecturers:
    db.add(l)
db.commit()

# Assign lecturers
assignments = [
    CourseLecturer(course_id=1, lecturer_id=1, role="Primary"),
    CourseLecturer(course_id=2, lecturer_id=1, role="Primary"),
    CourseLecturer(course_id=3, lecturer_id=2, role="Primary"),
]
for a in assignments:
    db.add(a)
db.commit()

# Seed schedule
days = ["Monday", "Wednesday", "Friday"]
for i, day in enumerate(days):
    schedule = Schedule(
        user_id=1,
        course_id=1,
        day_of_week=day,
        start_time=time(9, 0),
        end_time=time(11, 0),
        room="Room 101",
        semester="Fall 2024",
    )
    db.add(schedule)

schedule = Schedule(
    user_id=1,
    course_id=2,
    day_of_week="Tuesday",
    start_time=time(13, 0),
    end_time=time(15, 0),
    room="Room 205",
    semester="Fall 2024",
)
db.add(schedule)

schedule = Schedule(
    user_id=1,
    course_id=3,
    day_of_week="Thursday",
    start_time=time(11, 0),
    end_time=time(12, 0),
    room="Room 103",
    semester="Fall 2024",
)
db.add(schedule)
db.commit()

# Seed tasks
deadline1 = datetime.now() + timedelta(hours=20)
deadline2 = datetime.now() + timedelta(hours=50)
deadline3 = datetime.now() + timedelta(days=3)

tasks = [
    Task(user_id=1, course_id=1, title="Homework 1", description="Basic loops", deadline=deadline1, difficulty=3, kanban_status=KanbanStatus.in_progress),
    Task(user_id=1, course_id=2, title="Quiz 1", description="Matrix operations", deadline=deadline2, difficulty=4, kanban_status=KanbanStatus.todo),
    Task(user_id=1, course_id=3, title="Essay draft", description="Introduction section", deadline=deadline3, difficulty=2, kanban_status=KanbanStatus.done),
    Task(user_id=1, course_id=1, title="Project proposal", description="Choose topic", deadline=datetime.now() + timedelta(hours=15), difficulty=5, kanban_status=KanbanStatus.todo),
    Task(user_id=1, course_id=2, title="Lab report", description="Week 5", deadline=datetime.now() + timedelta(hours=30), difficulty=3, kanban_status=KanbanStatus.review),
]
for t in tasks:
    from app.services.priority import calculate_priority_score
    t.priority_score = calculate_priority_score(t.deadline, t.difficulty)
    db.add(t)
db.commit()

# Seed materials
materials = [
    Material(user_id=1, course_id=1, title="Lecture 1 Slides", session_number=1, drive_link="https://drive.google.com/1", type="lecture"),
    Material(user_id=1, course_id=1, title="Assignment 1", session_number=2, drive_link="https://drive.google.com/2", type="assignment"),
    Material(user_id=1, course_id=2, title="Syllabus", session_number=None, drive_link="https://drive.google.com/3", type="syllabus"),
]
for m in materials:
    db.add(m)
db.commit()

print("Seed data created successfully!")
db.close()