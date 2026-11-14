import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.models.brief import ExecutiveBrief
from app.schemas.brief import ExecutiveBriefCreate, ExecutiveBriefRead
from app.services.scheduler import scheduler_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate/{company_id}", response_model=ExecutiveBriefRead, status_code=status.HTTP_201_CREATED)
def generate_brief(company_id: int, db: Session = Depends(get_db)):
    """
    On-Demand or Scheduled Trigger:
    Compiles all analyzed signals into the structured 10-section Monday Morning Intelligence Brief.
    """
    try:
        brief = scheduler_service.generate_weekly_brief_for_company(company_id, db)
        return brief
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating brief: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate brief: {str(e)}")


@router.get("/latest/{company_id}", response_model=Optional[ExecutiveBriefRead])
def get_latest_brief(company_id: int, db: Session = Depends(get_db)):
    """Retrieve the most recent Monday Morning Brief for a company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    brief = db.query(ExecutiveBrief).filter(
        ExecutiveBrief.company_id == company_id
    ).order_by(ExecutiveBrief.generated_at.desc()).first()
    
    return brief


@router.get("/{company_id}", response_model=List[ExecutiveBriefRead])
def list_company_briefs(company_id: int, db: Session = Depends(get_db)):
    """List all historical Monday Morning Intelligence Briefs for a company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db.query(ExecutiveBrief).filter(
        ExecutiveBrief.company_id == company_id
    ).order_by(ExecutiveBrief.generated_at.desc()).all()


@router.get("/detail/{brief_id}", response_model=ExecutiveBriefRead)
def get_brief_by_id(brief_id: int, db: Session = Depends(get_db)):
    """Retrieve complete 10-section executive brief by ID."""
    brief = db.query(ExecutiveBrief).filter(ExecutiveBrief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief


@router.get("/export/markdown/{brief_id}")
def export_brief_markdown(brief_id: int, db: Session = Depends(get_db)):
    """Export formatted Markdown for download or email dispatch."""
    brief = db.query(ExecutiveBrief).filter(ExecutiveBrief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
        
    return Response(
        content=brief.raw_markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=founderbrief_{brief_id}.md"}
    )
