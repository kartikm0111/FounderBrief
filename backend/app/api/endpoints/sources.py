import json
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.models.interview import InterviewQA
from app.models.source import Source
from app.schemas.source import SourceCreate, SourceRead, SourceUpdate
from app.services.source_discovery import source_discovery_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/discover/{company_id}", response_model=List[SourceRead])
def discover_sources(company_id: int, db: Session = Depends(get_db)):
    """
    Autonomously discovers and justifies 20+ sources across Customers, Competitors, Market, and Internal.
    Guarantees 5-10 competitor profiles and 3-part justification (Specificity, Recency, Credibility).
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    research = json.loads(company.initial_research) if company.initial_research else {}
    research["description"] = company.description
    
    # Gather answered Q&A
    qa_records = db.query(InterviewQA).filter(InterviewQA.company_id == company_id).all()
    qa_answers = {
        q.category: q.answer_text for q in qa_records if q.answer_text and not q.is_skipped
    }

    discovered = source_discovery_service.discover_signal_stack(
        company_name=company.name,
        industry=company.industry or "Global Higher Education",
        research=research,
        qa_answers=qa_answers
    )

    registered_sources = []
    for item in discovered:
        # Check if source URL already exists for this company
        existing = db.query(Source).filter(
            Source.company_id == company_id,
            Source.url == item["url"]
        ).first()

        if not existing:
            src = Source(
                company_id=company_id,
                category=item["category"],
                name=item["name"],
                url=item["url"],
                source_type=item.get("source_type", "web_page"),
                reason_for_inclusion=item["reason_for_inclusion"],
                competitor_name=item.get("competitor_name"),
                is_approved=True,  # Default to approved, user can toggle in Source Manager
                is_active=True,
                health_status="healthy",
                relevance_score=item.get("relevance_score", 9.0)
            )
            db.add(src)
            registered_sources.append(src)
        else:
            registered_sources.append(existing)

    company.status = "stack_built"
    db.commit()

    return db.query(Source).filter(Source.company_id == company_id).order_by(Source.category, Source.name).all()


@router.get("/{company_id}", response_model=List[SourceRead])
def list_company_sources(
    company_id: int,
    category: Optional[str] = Query(None, description="customers, competitors, market, internal"),
    is_approved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all sources in the Signal Stack with optional category filtering."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    query = db.query(Source).filter(Source.company_id == company_id)
    if category:
        query = query.filter(Source.category == category)
    if is_approved is not None:
        query = query.filter(Source.is_approved == is_approved)
        
    return query.order_by(Source.category, Source.name).all()


@router.post("/", response_model=SourceRead, status_code=status.HTTP_201_CREATED)
def create_source(source_in: SourceCreate, db: Session = Depends(get_db)):
    """Manually add a verified source to the Signal Stack."""
    company = db.query(Company).filter(Company.id == source_in.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    source = Source(**source_in.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.put("/{source_id}/toggle-approval", response_model=SourceRead)
def toggle_source_approval(source_id: int, db: Session = Depends(get_db)):
    """Toggle source approval status (Approve / Reject)."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    source.is_approved = not source.is_approved
    db.commit()
    db.refresh(source)
    return source


@router.put("/{source_id}", response_model=SourceRead)
def update_source(source_id: int, source_in: SourceUpdate, db: Session = Depends(get_db)):
    """Update source parameters."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
        
    update_data = source_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(source, field, value)
        
    db.commit()
    db.refresh(source)
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_source(source_id: int, db: Session = Depends(get_db)):
    """Remove a source from the Signal Stack."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(source)
    db.commit()
    return None


@router.post("/internal/upload/{company_id}", response_model=SourceRead)
async def upload_internal_intelligence(
    company_id: int,
    file: UploadFile = File(...),
    doc_type: str = Form("sales_objections"),
    db: Session = Depends(get_db)
):
    """
    Ingest internal intelligence files (CSV, PDF, TXT) per specification:
    'Support future/internal inputs such as CRM exports, customer feedback, sales call transcripts...'
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    content_bytes = await file.read()
    file_name = file.filename
    size_kb = round(len(content_bytes) / 1024, 2)

    source = Source(
        company_id=company_id,
        category="internal",
        name=f"Internal File: {file_name}",
        url=f"internal://uploads/{file_name}",
        source_type="internal_document",
        reason_for_inclusion=f"Specificity: Proprietary internal intelligence document ({doc_type}, {size_kb} KB). | Recency: Fresh user upload. | Credibility: Firsthand organizational ground truth.",
        is_approved=True,
        is_active=True,
        health_status="healthy",
        relevance_score=9.8
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


@router.post("/reassess-context/{company_id}")
def reassess_company_context(
    company_id: int,
    new_context: str = Query(..., description="Description of the strategic business pivot or updated context"),
    db: Session = Depends(get_db)
):
    """
    Implements Requirement 12:
    'Also change the business context for one company after initial setup.
     The system should reassess source relevance, identify sources that are no longer useful,
     recommend new sources, update the Signal Stack and explain what changed.'
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    existing_sources = db.query(Source).filter(Source.company_id == company_id).all()
    source_dicts = [
        {"id": s.id, "name": s.name, "url": s.url, "category": s.category, "relevance_score": s.relevance_score}
        for s in existing_sources
    ]

    report = source_discovery_service.reassess_sources_for_context_change(
        company_name=company.name,
        current_sources=source_dicts,
        new_context=new_context
    )

    # Apply demotions
    for demoted_item in report.get("demoted_sources", []):
        src = db.query(Source).filter(Source.id == demoted_item["id"]).first()
        if src:
            src.relevance_score = demoted_item["new_score"]
            src.is_approved = False  # Deprecate from active crawl
            src.reason_for_inclusion = f"[DECLINED RELEVANCE] {src.reason_for_inclusion} | {demoted_item['reason']}"

    # Add new recommended sources
    added_sources = []
    for new_src in report.get("new_sources", []):
        existing = db.query(Source).filter(
            Source.company_id == company_id,
            Source.url == new_src["url"]
        ).first()
        if not existing:
            created = Source(
                company_id=company_id,
                category=new_src["category"],
                name=new_src["name"],
                url=new_src["url"],
                source_type=new_src.get("source_type", "regulatory_portal"),
                reason_for_inclusion=new_src["reason_for_inclusion"],
                competitor_name=new_src.get("competitor_name"),
                is_approved=True,
                is_active=True,
                health_status="healthy",
                relevance_score=new_src.get("relevance_score", 9.5)
            )
            db.add(created)
            added_sources.append(new_src["name"])

    # Update company description with context change
    company.description = f"{company.description}\n[Strategic Pivot]: {new_context}"
    db.commit()

    return {
        "status": "success",
        "company_id": company_id,
        "company_name": company.name,
        "new_context": new_context,
        "explanation": report["strategic_rationale"],
        "demoted_sources_count": len(report.get("demoted_sources", [])),
        "demoted_sources": report.get("demoted_sources", []),
        "added_sources_count": len(added_sources),
        "added_sources": added_sources
    }
