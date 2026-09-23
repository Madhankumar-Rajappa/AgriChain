from typing import Dict, Any, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationOut
from app.models.user import User


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def get_user_notifications(self, current_user: User, skip: int = 0, limit: int = 50) -> Dict[str, Any]:
        notifications, total = self.repo.get_user_notifications(user_id=current_user.id, skip=skip, limit=limit)
        unread_count = self.repo.get_unread_count(user_id=current_user.id)
        return {
            "items": [NotificationOut.model_validate(n) for n in notifications],
            "total": total,
            "unread_count": unread_count,
            "skip": skip,
            "limit": limit
        }

    def mark_as_read(self, current_user: User, notification_id: int) -> NotificationOut:
        notif = self.repo.mark_as_read(notification_id, current_user.id)
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification with ID {notification_id} not found."
            )
        return NotificationOut.model_validate(notif)

    def mark_all_as_read(self, current_user: User) -> Dict[str, int]:
        count = self.repo.mark_all_as_read(current_user.id)
        return {"updated": count}
