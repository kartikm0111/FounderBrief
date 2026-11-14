from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# For SQLite, check_same_thread=False allows multi-threaded operations in FastAPI
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that yields a database session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables based on registered models."""
    # Import all models to ensure they are registered with Base.metadata
    from app.models import (
        Company,
        InterviewQA,
        Source,
        IntelligenceSignal,
        ExecutiveBrief,
        AuditLog,
    )
    Base.metadata.create_all(bind=engine)
