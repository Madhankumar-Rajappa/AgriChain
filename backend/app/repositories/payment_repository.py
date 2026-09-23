from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.models.payment import Payment
from app.models.notification import Notification


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, payment_id: int) -> Optional[Payment]:
        return self.db.scalar(
            select(Payment)
            .options(joinedload(Payment.order), joinedload(Payment.buyer))
            .where(Payment.id == payment_id)
        )

    def get_by_order_id(self, order_id: int) -> Optional[Payment]:
        return self.db.scalar(
            select(Payment)
            .options(joinedload(Payment.order), joinedload(Payment.buyer))
            .where(Payment.order_id == order_id)
        )

    def create_payment(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def update_payment(self, payment: Payment) -> Payment:
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def create_notification(self, user_id: int, title: str, message: str, notification_type: str = "PAYMENT") -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            is_read=False
        )
        self.db.add(notif)
        self.db.commit()
        return notif
