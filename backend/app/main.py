from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize tables and initial seed data on startup
    logger.info("Running automatic database table verification and seeding...")
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/", summary="Root API Information")
def root():
    """
    Root endpoint returning AgriChain system metadata and API endpoints link.
    """
    return {
        "message": "Welcome to AgriChain API - Agricultural Supply Chain Management Platform",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "version": settings.VERSION
    }


# Include API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

logger.info(f"Initialized {settings.PROJECT_NAME} (v{settings.VERSION}) in {settings.ENVIRONMENT} mode.")
