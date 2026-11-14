from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class IntelligenceSignalBase(BaseModel):
    title: str
    summary: str
    category: str
    competitor_name: Optional[str] = None
    event_date: Optional[datetime] = None
    source_url: str
    evidence_snippet: str
    verification_status: str = "verified"
    business_impact: str
    affected_business_area: str
    classification: str = "neutral"
    relevance_score: float = 5.0
    impact_score: float = 5.0
    urgency_score: float = 5.0
    credibility_score: float = 5.0
    recency_score: float = 5.0
    novelty_score: float = 5.0
    composite_rank_score: float = 5.0
    ranking_explanation: str
    suggested_action: str


class IntelligenceSignalCreate(IntelligenceSignalBase):
    company_id: int
    source_id: Optional[int] = None


class IntelligenceSignalRead(IntelligenceSignalBase):
    id: int
    company_id: int
    source_id: Optional[int] = None
    discovery_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
