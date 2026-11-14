from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "FounderBrief - Company Intelligence & Executive Briefing Engine"
    API_V1_STR: str = "/api/v1"
    GITHUB_REPO_URL: str = "https://github.com/kartikm0111/FounderBrief"
    
    # Database
    DATABASE_URL: str = "sqlite:///./signal_stack.db"
    
    # AI / LLM Configuration (Free Tier APIs)
    # Supports Google Gemini API (Free tier) or Groq API (Free tier)
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "gemini"  # "gemini" or "groq"
    LLM_MODEL: str = "gemini-2.5-flash"  # or "llama-3.3-70b-versatile" for Groq
    
    # Web Scraping & Crawling settings
    DEFAULT_USER_AGENT: str = "SignalStackBot/1.0 (+https://signalstack.local; Ethical Academic Intelligence Agent)"
    CRAWL_TIMEOUT_SECONDS: int = 15
    RESPECT_ROBOTS_TXT: bool = True
    MAX_CRAWL_DEPTH: int = 1
    
    # Scheduler Settings
    WEEKLY_BRIEF_CRON: str = "0 8 * * 1"  # Every Monday at 08:00 AM
    MONTHLY_AUDIT_CRON: str = "0 0 1 * *"  # 1st of every month at midnight
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
