from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLogBase(BaseModel):
    task_type: str
    status: str
    summary: str
    details: Optional[str] = None
    error_message: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    company_id: Optional[int] = None


class AuditLogRead(AuditLogBase):
    id: int
    company_id: Optional[int] = None
    executed_at: datetime

    class Config:
        from_attributes = True
