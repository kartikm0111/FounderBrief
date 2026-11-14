from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InterviewQABase(BaseModel):
    question_number: int
    category: str
    question_text: str
    context_reason: str
    answer_text: Optional[str] = None
    is_skipped: bool = False
    follow_up_notes: Optional[str] = None


class InterviewAnswerSubmit(BaseModel):
    answer_text: Optional[str] = None
    is_skipped: bool = False


class InterviewQARead(InterviewQABase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewStatusResponse(BaseModel):
    company_id: int
    total_questions: int = 10
    answered_count: int
    skipped_count: int
    current_question: Optional[InterviewQARead] = None
    is_completed: bool
