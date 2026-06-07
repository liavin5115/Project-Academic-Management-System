from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.schedule import ScheduleOverride
from ..schemas.schedule import ScheduleOverrideCreate, ScheduleOverrideUpdate, ScheduleOverrideOut

router = APIRouter()


@router.get("/schedules/{schedule_id}/overrides", response_model=List[ScheduleOverrideOut])
def list_overrides(schedule_id: int, db: Session = Depends(get_db)):
    return db.query(ScheduleOverride).filter(ScheduleOverride.schedule_id == schedule_id).all()


@router.post("/schedules/{schedule_id}/overrides", response_model=ScheduleOverrideOut)
def create_override(schedule_id: int, payload: ScheduleOverrideCreate, db: Session = Depends(get_db)):
    override = ScheduleOverride(**payload.model_dump())
    db.add(override)
    db.commit()
    db.refresh(override)
    return override


@router.put("/overrides/{override_id}", response_model=ScheduleOverrideOut)
def update_override(override_id: int, payload: ScheduleOverrideUpdate, db: Session = Depends(get_db)):
    override = db.query(ScheduleOverride).filter(ScheduleOverride.id == override_id).first()
    if not override:
        raise HTTPException(status_code=404, detail="Override not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(override, key, value)
    db.commit()
    db.refresh(override)
    return override


@router.delete("/overrides/{override_id}")
def delete_override(override_id: int, db: Session = Depends(get_db)):
    override = db.query(ScheduleOverride).filter(ScheduleOverride.id == override_id).first()
    if not override:
        raise HTTPException(status_code=404, detail="Override not found")
    db.delete(override)
    db.commit()
    return {"detail": "Override deleted"}