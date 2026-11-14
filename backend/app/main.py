from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.api_v1 import api_router
from app.services.scheduler import scheduler_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and tables on startup
    init_db()
    # Start APScheduler background automation
    scheduler_service.start()
    yield
    # Graceful shutdown
    scheduler_service.shutdown()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FounderBrief - AI-Powered Company Intelligence & Executive Briefing Engine (Signal Stack Architecture)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.LLM_MODEL
    }
