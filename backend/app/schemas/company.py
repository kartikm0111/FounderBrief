from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, HttpUrl


class CompanyBase(BaseModel):
    name: str
    website_url: str
    industry: Optional[str] = None
    description: Optional[str] = None


class CompanyCreate(BaseModel):
    name: str
    website_url: str


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    verified_facts: Optional[str] = None
    assumptions: Optional[str] = None
    initial_research: Optional[str] = None
    intelligence_profile: Optional[str] = None
    status: Optional[str] = None


class CompanyRead(CompanyBase):
    id: int
    verified_facts: Optional[str] = None
    assumptions: Optional[str] = None
    initial_research: Optional[str] = None
    intelligence_profile: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
