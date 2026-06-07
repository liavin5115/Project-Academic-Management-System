from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.task import Task
from ..models.course import Course
from ..models.user import User
from ..schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskReorder
from ..services.priority import calculate_priority_score
from .auth import get_current_user

router = APIRouter()

@router.get("/tasks", response_model=List[TaskOut])
def list_tasks(sort: str = "deadline", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Task).join(Course).filter(Task.user_id == current_user.id)
    if sort == "priority":
        query = query.order_by(Task.priority_score.desc())
    elif sort == "kanban":
        query = query.order_by(Task.kanban_status, Task.position)
    else:
        query = query.order_by(Task.deadline)

    tasks = query.all()
    return [
        TaskOut(
            id=t.id,
            course_id=t.course_id,
            course_name=t.course.name,
            title=t.title,
            description=t.description,
            deadline=t.deadline,
            difficulty=t.difficulty,
            priority_score=t.priority_score,
            status=t.status,
            kanban_status=t.kanban_status,
            position=t.position,
        )
        for t in tasks
    ]

@router.post("/tasks", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Invalid course_id or course does not belong to user")
        
    priority = calculate_priority_score(payload.deadline, payload.difficulty)
    task = Task(**payload.model_dump(), priority_score=priority, user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskOut(
        id=task.id,
        course_id=task.course_id,
        course_name=course.name,
        title=task.title,
        description=task.description,
        deadline=task.deadline,
        difficulty=task.difficulty,
        priority_score=task.priority_score,
        status=task.status,
        kanban_status=task.kanban_status,
        position=task.position,
    )

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)

    task.priority_score = calculate_priority_score(task.deadline, task.difficulty)
    db.commit()
    db.refresh(task)
    return TaskOut(
        id=task.id,
        course_id=task.course_id,
        course_name=task.course.name,
        title=task.title,
        description=task.description,
        deadline=task.deadline,
        difficulty=task.difficulty,
        priority_score=task.priority_score,
        status=task.status,
        kanban_status=task.kanban_status,
        position=task.position,
    )

@router.patch("/tasks/reorder")
def reorder_tasks(payload: TaskReorder, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for update in payload.tasks:
        task = db.query(Task).filter(Task.id == update.id, Task.user_id == current_user.id).first()
        if task:
            task.kanban_status = update.kanban_status
            task.position = update.position
    db.commit()
    return {"detail": "Tasks reordered"}

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted"}