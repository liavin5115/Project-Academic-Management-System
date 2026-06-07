from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.course import Course
from ..models.lecturer import CourseLecturer
from ..models.user import User
from ..schemas.course import CourseCreate, CourseUpdate, CourseOut
from ..schemas.lecturer import LecturerOut
from .auth import get_current_user

router = APIRouter()


@router.get("/courses", response_model=List[CourseOut])
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    return [
        CourseOut(
            id=c.id,
            code=c.code,
            name=c.name,
            credits=c.credits,
            description=c.description,
            grade=c.grade,
            lecturer_count=len(c.course_lecturers),
        )
        for c in courses
    ]


@router.post("/courses", response_model=CourseOut)
def create_course(payload: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = Course(**payload.model_dump(), user_id=current_user.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseOut(**payload.model_dump(), id=course.id, lecturer_count=0)


@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        credits=course.credits,
        description=course.description,
        grade=course.grade,
        lecturer_count=len(course.course_lecturers),
    )


@router.put("/courses/{course_id}", response_model=CourseOut)
def update_course(course_id: int, payload: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return CourseOut(
        id=course.id,
        code=course.code,
        name=course.name,
        credits=course.credits,
        description=course.description,
        grade=course.grade,
        lecturer_count=len(course.course_lecturers),
    )


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"detail": "Course deleted"}


@router.post("/courses/{course_id}/lecturers")
def assign_lecturer(course_id: int, lecturer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    assignment = CourseLecturer(course_id=course_id, lecturer_id=lecturer_id)
    db.add(assignment)
    db.commit()
    return {"detail": "Lecturer assigned"}


@router.delete("/courses/{course_id}/lecturers/{lecturer_id}")
def remove_lecturer(course_id: int, lecturer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    assignment = (
        db.query(CourseLecturer)
        .filter(CourseLecturer.course_id == course_id, CourseLecturer.lecturer_id == lecturer_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"detail": "Lecturer removed"}