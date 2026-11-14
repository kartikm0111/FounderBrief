import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.company import Company
from app.models.interview import InterviewQA
from app.schemas.interview import (
    InterviewQARead,
    InterviewAnswerSubmit,
    InterviewStatusResponse,
)
from app.services.llm import llm_service

router = APIRouter()


@router.get("/{company_id}", response_model=List[InterviewQARead])
def get_interview_questions(company_id: int, db: Session = Depends(get_db)):
    """Retrieve all 10 contextual interview questions for a company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db.query(InterviewQA).filter(InterviewQA.company_id == company_id).order_by(InterviewQA.question_number).all()


@router.get("/{company_id}/status", response_model=InterviewStatusResponse)
def get_interview_status(company_id: int, db: Session = Depends(get_db)):
    """Get interview progress, answered count, and current active question."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    questions = db.query(InterviewQA).filter(InterviewQA.company_id == company_id).order_by(InterviewQA.question_number).all()
    answered_count = sum(1 for q in questions if q.answer_text is not None and not q.is_skipped)
    skipped_count = sum(1 for q in questions if q.is_skipped)
    
    # Current question is the first one that is neither answered nor skipped
    current_q = next((q for q in questions if q.answer_text is None and not q.is_skipped), None)
    is_completed = (len(questions) == 10) and (current_q is None)
    
    return InterviewStatusResponse(
        company_id=company_id,
        total_questions=len(questions),
        answered_count=answered_count,
        skipped_count=skipped_count,
        current_question=InterviewQARead.model_validate(current_q) if current_q else None,
        is_completed=is_completed,
    )


@router.post("/{company_id}/questions/{question_number}/answer", response_model=InterviewQARead)
def answer_question(
    company_id: int,
    question_number: int,
    payload: InterviewAnswerSubmit,
    db: Session = Depends(get_db)
):
    """
    Submit answer for a specific question (1 to 10).
    Remembers previous answers and respects confidentiality skipping.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    q = db.query(InterviewQA).filter(
        InterviewQA.company_id == company_id,
        InterviewQA.question_number == question_number
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if payload.is_skipped:
        q.is_skipped = True
        q.answer_text = None
    else:
        q.answer_text = payload.answer_text.strip() if payload.answer_text else ""
        q.is_skipped = False
        
    db.commit()
    db.refresh(q)
    return q


@router.put("/{company_id}/questions/{question_number}/edit", response_model=InterviewQARead)
def edit_question_answer(
    company_id: int,
    question_number: int,
    payload: InterviewAnswerSubmit,
    db: Session = Depends(get_db)
):
    """
    Requirement: Allow founder to edit or update prior answers later.
    """
    q = db.query(InterviewQA).filter(
        InterviewQA.company_id == company_id,
        InterviewQA.question_number == question_number
    ).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    if payload.is_skipped:
        q.is_skipped = True
        q.answer_text = None
    else:
        q.answer_text = payload.answer_text.strip() if payload.answer_text else ""
        q.is_skipped = False
        
    db.commit()
    db.refresh(q)
    return q


@router.post("/{company_id}/complete")
def finalize_interview(company_id: int, db: Session = Depends(get_db)):
    """
    Synthesizes the complete structured Company Intelligence Profile once interview is done.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    questions = db.query(InterviewQA).filter(InterviewQA.company_id == company_id).order_by(InterviewQA.question_number).all()
    qa_list = [
        {
            "question_number": q.question_number,
            "category": q.category,
            "question_text": q.question_text,
            "answer_text": q.answer_text,
            "is_skipped": q.is_skipped
        }
        for q in questions
    ]
    
    initial_research = json.loads(company.initial_research) if company.initial_research else {}
    initial_research["industry"] = company.industry
    initial_research["description"] = company.description
    
    profile = llm_service.synthesize_intelligence_profile(company.name, initial_research, qa_list)
    company.intelligence_profile = json.dumps(profile)
    company.status = "interview_completed"
    
    db.commit()
    db.refresh(company)
    return {
        "status": "interview_completed",
        "company_id": company.id,
        "intelligence_profile": profile
    }
