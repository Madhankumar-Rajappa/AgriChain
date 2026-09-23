from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.models.order import Order, OrderStatus
from app.models.notification import Notification
from app.models.crop import Crop


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return self.db.scalar(
            select(Order)
            .options(
                joinedload(Order.buyer),
                joinedload(Order.farmer),
                joinedload(Order.crop)
            )
            .where(Order.id == order_id)
        )

    def create_order(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_order(self, order: Order) -> Order:
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_buyer_orders(
        self,
        buyer_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[OrderStatus] = None
    ) -> Tuple[List[Order], int]:
        stmt = (
            select(Order)
            .options(joinedload(Order.buyer), joinedload(Order.farmer), joinedload(Order.crop))
            .where(Order.buyer_id == buyer_id)
        )
        if status:
            stmt = stmt.where(Order.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        orders = self.db.scalars(stmt.order_by(Order.created_at.desc()).offset(skip).limit(limit)).all()
        return list(orders), total

    def get_farmer_incoming_orders(
        self,
        farmer_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[OrderStatus] = None
    ) -> Tuple[List[Order], int]:
        stmt = (
            select(Order)
            .options(joinedload(Order.buyer), joinedload(Order.farmer), joinedload(Order.crop))
            .where(Order.farmer_id == farmer_id)
        )
        if status:
            stmt = stmt.where(Order.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        orders = self.db.scalars(stmt.order_by(Order.created_at.desc()).offset(skip).limit(limit)).all()
        return list(orders), total

    def create_notification(self, user_id: int, title: str, message: str, notification_type: str = "ORDER") -> Notification:
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
