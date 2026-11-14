from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 4 distinct categories per requirements: "customers", "competitors", "market", "internal"
    category = Column(String(50), nullable=False, index=True)
    
    # Human-readable title/name of the source
    name = Column(String(255), nullable=False)
    
    # The URL to monitor or file reference for internal intelligence
    url = Column(String(1024), nullable=False)
    
    # Type of source: "competitor_site", "review_platform", "forum_community", "industry_news", "regulatory_portal", "file_upload"
    source_type = Column(String(50), nullable=False, default="web_page")
    
    # Critical requirement: Justification covering:
    # 1. Specificity (relevance to problem space)
    # 2. Recency (regularly updated)
    # 3. Credibility (reliable information)
    reason_for_inclusion = Column(Text, nullable=False)
    
    # If category == "competitors", name of the competitor
    competitor_name = Column(String(255), nullable=True)
    
    # Approval and lifecycle flags
    is_approved = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Source health monitoring ("healthy", "warning", "dead", "inactive")
    health_status = Column(String(50), default="healthy", nullable=False)
    last_status_code = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    last_crawled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relevance rating (1.0 to 10.0)
    relevance_score = Column(Float, default=1.0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="sources")
    signals = relationship("IntelligenceSignal", back_populates="source")
