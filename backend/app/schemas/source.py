from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SourceBase(BaseModel):
    category: str  # "customers", "competitors", "market", "internal"
    name: str
    url: str
    source_type: str = "web_page"
    reason_for_inclusion: str
    competitor_name: Optional[str] = None
    relevance_score: float = 1.0


class SourceCreate(SourceBase):
    company_id: int
    is_approved: bool = True


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    reason_for_inclusion: Optional[str] = None
    competitor_name: Optional[str] = None
    is_approved: Optional[bool] = None
    is_active: Optional[bool] = None
    health_status: Optional[str] = None
    relevance_score: Optional[float] = None


class SourceRead(SourceBase):
    id: int
    company_id: int
    is_approved: bool
    is_active: bool
    health_status: str
    last_status_code: Optional[int] = None
    error_message: Optional[str] = None
    last_crawled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
