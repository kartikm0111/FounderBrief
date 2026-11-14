from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class IntelligenceSignal(Base):
    __tablename__ = "intelligence_signals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Core event descriptors
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False)
    
    # Categorization: "customers", "competitors", "market", "internal"
    category = Column(String(50), nullable=False, index=True)
    competitor_name = Column(String(255), nullable=True)
    
    # Timestamps & Lineage
    event_date = Column(DateTime(timezone=True), nullable=True)
    discovery_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    source_url = Column(String(1024), nullable=False)
    
    # Anti-hallucination requirement: Grounded evidence snippet with exact quotes or observed facts
    evidence_snippet = Column(Text, nullable=False)
    
    # Distinguish verified facts from strategic interpretation
    # "verified", "unverified", "assumed"
    verification_status = Column(String(50), default="verified", nullable=False)
    
    # Strategic interpretation: why it matters
    business_impact = Column(Text, nullable=False)
    
    # Business unit affected: "Product", "Pricing", "Customer Acquisition", "Regulatory Compliance", "Retention", etc.
    affected_business_area = Column(String(100), nullable=False)
    
    # Strategic posture: "opportunity", "threat", "neutral"
    classification = Column(String(50), default="neutral", nullable=False)
    
    # Granular scoring dimensions (0.0 - 10.0)
    relevance_score = Column(Float, nullable=False, default=5.0)
    impact_score = Column(Float, nullable=False, default=5.0)
    urgency_score = Column(Float, nullable=False, default=5.0)
    credibility_score = Column(Float, nullable=False, default=5.0)
    recency_score = Column(Float, nullable=False, default=5.0)
    novelty_score = Column(Float, nullable=False, default=5.0)
    
    # Algorithmic composite score based on evaluation criteria
    composite_rank_score = Column(Float, nullable=False, index=True, default=5.0)
    ranking_explanation = Column(Text, nullable=False)
    
    # Concrete action proposal
    suggested_action = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="signals")
    source = relationship("Source", back_populates="signals")
