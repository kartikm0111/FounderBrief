from fastapi import APIRouter
from app.api.endpoints import companies, interview, sources, signals, briefs, audit

api_router = APIRouter()

api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(interview.router, prefix="/interview", tags=["Adaptive Interview"])
api_router.include_router(sources.router, prefix="/sources", tags=["Signal Stack Sources"])
api_router.include_router(signals.router, prefix="/signals", tags=["Intelligence Signals"])
api_router.include_router(briefs.router, prefix="/briefs", tags=["Executive Briefs"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit & Automation Logs"])
