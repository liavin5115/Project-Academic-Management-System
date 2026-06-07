from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.gpa import GPAReport
from ..schemas.gpa import GPAReportCreate, GPAReportOut
from ..routers.auth import get_current_user

router = APIRouter(
    prefix="/gpa",
    tags=["GPA Reports"]
)

@router.get("", response_model=List[GPAReportOut])
def get_gpa_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reports = db.query(GPAReport).filter(GPAReport.user_id == current_user.id).order_by(GPAReport.created_at.asc()).all()
    return reports

@router.post("", response_model=GPAReportOut, status_code=status.HTTP_201_CREATED)
def create_gpa_report(report: GPAReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_report = GPAReport(**report.dict(), user_id=current_user.id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gpa_report(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(GPAReport).filter(GPAReport.id == report_id, GPAReport.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return None
