from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ExecutiveBrief(Base):
    __tablename__ = "briefs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 10 Strictly Required Sections from Specification:
    # 1. Executive Summary — 5 most important developments
    executive_summary = Column(Text, nullable=False)
    
    # 2. Customer Signals — emerging problems, complaints, expectations, unmet needs
    customer_signals = Column(Text, nullable=False)
    
    # 3. Competitor Intelligence — what changed, evidence, why it matters
    competitor_intelligence = Column(Text, nullable=False)
    
    # 4. Market Intelligence — regulatory, industry, tech shifts
    market_intelligence = Column(Text, nullable=False)
    
    # 5. Internal Business Intelligence — objections, sales patterns, product feedback
    internal_intelligence = Column(Text, nullable=False)
    
    # 6. Opportunities Identified — at least 3 actionable opportunities with evidence & priority
    opportunities_identified = Column(Text, nullable=False)
    
    # 7. Risks & Threats — important negative developments, impact & urgency
    risks_and_threats = Column(Text, nullable=False)
    
    # 8. Recommended Actions for This Week — prioritized actions with owner & rationale
    recommended_actions = Column(Text, nullable=False)
    
    # 9. What We Should Watch — early developments to track
    what_we_should_watch = Column(Text, nullable=False)
    
    # 10. Source Appendix — JSON array of {source_name, direct_link, pub_date, discovery_date, snippet, status}
    source_appendix = Column(Text, nullable=False)
    
    # Full exportable markdown representation for download / email dispatch
    raw_markdown = Column(Text, nullable=False)
    
    status = Column(String(50), default="published", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    company = relationship("Company", back_populates="briefs")
