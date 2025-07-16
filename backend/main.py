from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os
from middleware import rate_limit_middleware, default_limiter, CSRFProtection

# Load environment variables
load_dotenv()

# Initialize CSRF protection
csrf_protection = CSRFProtection(
    secret_key=os.getenv("SECRET_KEY", "your-secret-key-change-in-production"),
    exclude_paths={"/docs", "/redoc", "/openapi.json", "/health", "/"}
)

# Create FastAPI instance
app = FastAPI(
    title="KatalisApp API",
    description="API for KatalisApp - Financial SaaS for entrepreneurs",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3001",
        "https://katalis-app-32c9h.ondigitalocean.app",
        "https://katalisapp.com",
        "https://www.katalisapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add CSRF protection middleware
@app.middleware("http")
async def add_csrf_protection(request: Request, call_next):
    return await csrf_protection(request, call_next)

# Add rate limiting middleware
@app.middleware("http")
async def add_rate_limiting(request: Request, call_next):
    return await rate_limit_middleware(request, call_next, default_limiter)

# Startup event to initialize cleanup tasks
@app.on_event("startup")
async def startup_event():
    # Start cleanup task for rate limiter
    await default_limiter.start_cleanup()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "KatalisApp API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "KatalisApp API",
        "version": "1.0.0"
    }

# API endpoints will be added here
from api import (
    auth, dashboard, cash_flow, unit_economics, costs_pricing, 
    profitability, planning, configuration, help, support, progress,
    admin, user_auth, ai, reports, langchain_agents, notifications, search
)
from api import ai_insights
from app.api import live_metrics

# Security middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    
    # Prevent search engine indexing of API routes
    if request.url.path.startswith("/api/"):
        response.headers["X-Robots-Tag"] = "noindex, nofollow"
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response

# Include routers
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(user_auth.router, prefix="/api", tags=["User Authentication"])
app.include_router(ai.router, prefix="/api", tags=["AI Services"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(cash_flow.router, prefix="/api/cash-flow", tags=["cash-flow"])
app.include_router(unit_economics.router, prefix="/api/unit-economics", tags=["unit-economics"])
app.include_router(costs_pricing.router, prefix="/api/costs-pricing", tags=["costs-pricing"])
app.include_router(profitability.router, prefix="/api/profitability", tags=["profitability"])
app.include_router(planning.router, prefix="/api/planning", tags=["planning"])
app.include_router(ai_insights.router, tags=["AI Insights"])
app.include_router(configuration.router, prefix="/api", tags=["Configuration"])
app.include_router(help.router, prefix="/api", tags=["Help & Documentation"])
app.include_router(support.router, prefix="/api", tags=["Support"])
app.include_router(progress.router, prefix="/api/progress", tags=["Learning Progress"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(langchain_agents.router, prefix="/api", tags=["LangChain AI Agents"])

# Agent endpoints
from app.routers import agents
app.include_router(agents.router, prefix="/api", tags=["Agents"])

# New API integrations
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(search.router, tags=["Search"]) 
app.include_router(live_metrics.router, tags=["Live Metrics"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )