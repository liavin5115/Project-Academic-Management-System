from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.material import Material
from ..models.course import Course
from ..models.user import User
from ..schemas.material import MaterialCreate, MaterialUpdate, MaterialOut
from .auth import get_current_user

router = APIRouter()

@router.get("/materials", response_model=List[MaterialOut])
def list_materials(course_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Material).join(Course).filter(Material.user_id == current_user.id)
    if course_id:
        query = query.filter(Material.course_id == course_id)
    return [
        MaterialOut(
            id=m.id,
            course_id=m.course_id,
            course_name=m.course.name if m.course else "",
            title=m.title,
            session_number=m.session_number,
            drive_link=m.drive_link,
            type=m.type,
        )
        for m in query.all()
    ]

@router.post("/materials", response_model=MaterialOut)
def create_material(payload: MaterialCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Invalid course_id or course does not belong to user")
        
    material = Material(**payload.model_dump(), user_id=current_user.id)
    db.add(material)
    db.commit()
    db.refresh(material)
    return MaterialOut(**payload.model_dump(), id=material.id, course_name="")

@router.put("/materials/{material_id}", response_model=MaterialOut)
def update_material(material_id: int, payload: MaterialUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    if payload.course_id:
        course = db.query(Course).filter(Course.id == payload.course_id, Course.user_id == current_user.id).first()
        if not course:
            raise HTTPException(status_code=400, detail="Invalid course_id or course does not belong to user")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(material, key, value)
    db.commit()
    db.refresh(material)
    return MaterialOut(
        id=material.id,
        course_id=material.course_id,
        course_name=material.course.name if material.course else "",
        title=material.title,
        session_number=material.session_number,
        drive_link=material.drive_link,
        type=material.type,
    )

@router.delete("/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(material)
    db.commit()
    return {"detail": "Material deleted"}