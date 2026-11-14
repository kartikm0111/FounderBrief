from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    
    # Task type: "weekly_brief", "monthly_audit", "manual_crawl"
    task_type = Column(String(50), nullable=False)
    
    # Status: "success", "failed", "running"
    status = Column(String(50), nullable=False)
    
    # Summary of metrics (e.g., "Audited 24 sources: 2 dead URLs found, 1 duplicate removed, 3 new recommended")
    summary = Column(Text, nullable=False)
    
    # JSON-encoded detailed diagnostics and recommendations
    details = Column(Text, nullable=True)
    
    error_message = Column(Text, nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    company = relationship("Company", back_populates="audit_logs")
