from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    website_url = Column(String(512), nullable=False)
    industry = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    
    # Clearly separated verified facts vs. assumptions from initial research
    verified_facts = Column(Text, nullable=True)  # JSON-encoded array of verified facts with citations
    assumptions = Column(Text, nullable=True)     # JSON-encoded array of explicit assumptions
    
    # Structured context: products/services, customer segments, positioning
    initial_research = Column(Text, nullable=True)  # JSON-encoded object
    
    # Dynamic company intelligence profile compiled from research + adaptive interview
    intelligence_profile = Column(Text, nullable=True)  # JSON-encoded object
    
    # Workflow status: "setup", "interviewing", "interview_completed", "stack_built", "monitoring"
    status = Column(String(50), default="setup", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    interview_qa = relationship("InterviewQA", back_populates="company", cascade="all, delete-orphan", order_by="InterviewQA.question_number")
    sources = relationship("Source", back_populates="company", cascade="all, delete-orphan")
    signals = relationship("IntelligenceSignal", back_populates="company", cascade="all, delete-orphan")
    briefs = relationship("ExecutiveBrief", back_populates="company", cascade="all, delete-orphan", order_by="desc(ExecutiveBrief.generated_at)")
    audit_logs = relationship("AuditLog", back_populates="company", cascade="all, delete-orphan")
