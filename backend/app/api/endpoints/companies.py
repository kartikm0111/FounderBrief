import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.models.interview import InterviewQA
from app.models.source import Source
from app.models.signal import IntelligenceSignal
from app.models.brief import ExecutiveBrief
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate
from app.services.scraper import scraper_service
from app.services.llm import llm_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[CompanyRead])
def list_companies(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List all configured companies in Signal Stack."""
    return db.query(Company).order_by(Company.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/setup", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def setup_company(company_in: CompanyCreate, db: Session = Depends(get_db)):
    """
    Core End-to-End Company Setup Workflow:
    1. Accepts company name & website URL.
    2. Respects robots.txt and scrapes public context.
    3. Analyzes verified facts vs. assumptions.
    4. Dynamically generates exactly 10 contextual founder interview questions.
    """
    url = company_in.website_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = f"https://{url}"

    name = company_in.name.strip()

    # Check if company already exists
    existing = db.query(Company).filter(Company.name.ilike(name)).first()
    if existing:
        company = existing
        company.website_url = url
        # Clean previous signals, sources, briefs, and Q&A to ensure pristine state
        db.query(IntelligenceSignal).filter(IntelligenceSignal.company_id == company.id).delete()
        db.query(Source).filter(Source.company_id == company.id).delete()
        db.query(ExecutiveBrief).filter(ExecutiveBrief.company_id == company.id).delete()
        db.query(InterviewQA).filter(InterviewQA.company_id == company.id).delete()
    else:
        company = Company(name=name, website_url=url, status="setup")
        db.add(company)
        db.commit()
        db.refresh(company)

    # 1. Scrape public website context
    scraped_context = scraper_service.scrape_public_context(url)

    # 2. Extract verified facts, assumptions, and structured initial research
    analysis = llm_service.analyze_company_research(name, url, scraped_context)
    
    company.industry = analysis.get("industry")
    company.description = analysis.get("description")
    company.verified_facts = json.dumps(analysis.get("verified_facts", []))
    company.assumptions = json.dumps(analysis.get("assumptions", []))
    company.initial_research = json.dumps(analysis.get("initial_research", {}))
    company.status = "interviewing"
    
    db.commit()
    db.refresh(company)

    # 3. Generate 10 contextual interview questions
    questions = llm_service.generate_10_interview_questions(name, analysis)
    
    # Clean previous Q&A for this company if any
    db.query(InterviewQA).filter(InterviewQA.company_id == company.id).delete()
    
    for q_data in questions:
        qa_record = InterviewQA(
            company_id=company.id,
            question_number=q_data["question_number"],
            category=q_data["category"],
            question_text=q_data["question_text"],
            context_reason=q_data["context_reason"],
            answer_text=None,
            is_skipped=False
        )
        db.add(qa_record)
        
    db.commit()
    db.refresh(company)
    return company


@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Retrieve full company intelligence profile by ID."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyRead)
def update_company(company_id: int, company_in: CompanyUpdate, db: Session = Depends(get_db)):
    """Update company profile, verified facts, or business context."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
        
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company and its entire signal stack."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(company)
    db.commit()
    return None
