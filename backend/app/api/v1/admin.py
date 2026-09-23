from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_roles
from app.schemas.admin import AdminAnalyticsOut
from app.models.user import User, UserRole
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin Portal & Analytics"])


@router.get("/analytics", response_model=AdminAnalyticsOut, summary="Get Platform Analytics (Admin Only)")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """
    Returns aggregated metrics across users, crops, orders, financial volume, storage occupancy, and logistics.
    """
    service = AdminService(db)
    return service.get_system_analytics(current_user)
