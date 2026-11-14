from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogCreate, AuditLogRead
from app.services.scheduler import scheduler_service

router = APIRouter()


@router.post("/trigger-monthly/{company_id}", response_model=AuditLogRead)
def trigger_monthly_audit(company_id: int, db: Session = Depends(get_db)):
    """
    On-Demand or Scheduled Trigger:
    Performs Monthly Signal Stack Audit checking dead URLs, source duplicates, and health ratings.
    """
    try:
        audit_log = scheduler_service.audit_sources_for_company(company_id, db)
        return audit_log
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/latest/{company_id}", response_model=Optional[AuditLogRead])
def get_latest_audit(company_id: int, db: Session = Depends(get_db)):
    """Retrieve the most recent audit report for a company."""
    return db.query(AuditLog).filter(
        AuditLog.company_id == company_id
    ).order_by(AuditLog.executed_at.desc()).first()


@router.get("/", response_model=List[AuditLogRead])
def list_audit_logs(
    company_id: Optional[int] = Query(None),
    task_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve audit history and scheduled automation run logs."""
    query = db.query(AuditLog)
    if company_id is not None:
        query = query.filter(AuditLog.company_id == company_id)
    if task_type:
        query = query.filter(AuditLog.task_type == task_type)
    return query.order_by(AuditLog.executed_at.desc()).offset(skip).limit(limit).all()
