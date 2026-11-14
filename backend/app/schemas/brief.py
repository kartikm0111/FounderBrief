from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ExecutiveBriefBase(BaseModel):
    title: str
    executive_summary: str
    customer_signals: str
    competitor_intelligence: str
    market_intelligence: str
    internal_intelligence: str
    opportunities_identified: str
    risks_and_threats: str
    recommended_actions: str
    what_we_should_watch: str
    source_appendix: str
    raw_markdown: str


class ExecutiveBriefCreate(ExecutiveBriefBase):
    company_id: int


class ExecutiveBriefRead(ExecutiveBriefBase):
    id: int
    company_id: int
    generated_at: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
