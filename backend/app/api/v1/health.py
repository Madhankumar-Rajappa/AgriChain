from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.db.session import check_db_connection

router = APIRouter()


@router.get("/health", summary="Perform System Health Check")
def health_check():
    """
    Returns API health status, system time, environment, and MySQL database connectivity status.
    """
    db_connected = check_db_connection()
    status = "ok" if db_connected else "degraded"
    
    return {
        "status": status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_connected else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
