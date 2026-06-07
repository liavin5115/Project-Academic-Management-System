from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.lecturer import Lecturer
from ..schemas.lecturer import LecturerCreate, LecturerUpdate, LecturerOut

router = APIRouter()


@router.get("/lecturers", response_model=List[LecturerOut])
def list_lecturers(db: Session = Depends(get_db)):
    return db.query(Lecturer).all()


@router.post("/lecturers", response_model=LecturerOut)
def create_lecturer(payload: LecturerCreate, db: Session = Depends(get_db)):
    lecturer = Lecturer(**payload.model_dump())
    db.add(lecturer)
    db.commit()
    db.refresh(lecturer)
    return lecturer


@router.put("/lecturers/{lecturer_id}", response_model=LecturerOut)
def update_lecturer(lecturer_id: int, payload: LecturerUpdate, db: Session = Depends(get_db)):
    lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id).first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(lecturer, key, value)
    db.commit()
    db.refresh(lecturer)
    return lecturer


@router.delete("/lecturers/{lecturer_id}")
def delete_lecturer(lecturer_id: int, db: Session = Depends(get_db)):
    lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id).first()
    if not lecturer:
        raise HTTPException(status_code=404, detail="Lecturer not found")
    db.delete(lecturer)
    db.commit()
    return {"detail": "Lecturer deleted"}