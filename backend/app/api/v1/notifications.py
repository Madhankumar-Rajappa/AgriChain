from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user
from app.schemas.notification import NotificationOut
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["User Notifications Hub"])


@router.get("/mine", summary="Get Current User Notifications")
def get_my_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Returns in-app notifications for the currently logged-in user with unread count.
    """
    service = NotificationService(db)
    return service.get_user_notifications(current_user, skip=skip, limit=limit)


@router.patch("/{notification_id}/read", response_model=NotificationOut, summary="Mark Notification as Read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Marks a specific notification as read.
    """
    service = NotificationService(db)
    return service.mark_as_read(current_user, notification_id)


@router.post("/mark-all-read", summary="Mark All Notifications as Read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Marks all unread notifications for the currently logged-in user as read.
    """
    service = NotificationService(db)
    return service.mark_all_as_read(current_user)
