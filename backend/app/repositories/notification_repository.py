from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func, update
from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 50) -> Tuple[List[Notification], int]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        notifications = self.db.scalars(
            stmt.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
        ).all()
        return list(notifications), total

    def get_unread_count(self, user_id: int) -> int:
        return self.db.scalar(
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
        ) or 0

    def mark_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        notif = self.db.scalar(
            select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        )
        if notif:
            notif.is_read = True
            self.db.commit()
            self.db.refresh(notif)
        return notif

    def mark_all_as_read(self, user_id: int) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount
