from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.models.shipment import Shipment, ShipmentStatus
from app.models.notification import Notification


class ShipmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, shipment_id: int) -> Optional[Shipment]:
        return self.db.scalar(
            select(Shipment)
            .options(
                joinedload(Shipment.order),
                joinedload(Shipment.transporter),
                joinedload(Shipment.warehouse)
            )
            .where(Shipment.id == shipment_id)
        )

    def get_by_order_id(self, order_id: int) -> Optional[Shipment]:
        return self.db.scalar(
            select(Shipment)
            .options(
                joinedload(Shipment.order),
                joinedload(Shipment.transporter),
                joinedload(Shipment.warehouse)
            )
            .where(Shipment.order_id == order_id)
        )

    def get_transporter_shipments(
        self,
        transporter_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ShipmentStatus] = None
    ) -> Tuple[List[Shipment], int]:
        stmt = (
            select(Shipment)
            .options(joinedload(Shipment.order), joinedload(Shipment.warehouse))
            .where(Shipment.transporter_id == transporter_id)
        )
        if status:
            stmt = stmt.where(Shipment.shipment_status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        shipments = self.db.scalars(stmt.order_by(Shipment.created_at.desc()).offset(skip).limit(limit)).all()
        return list(shipments), total

    def create_shipment(self, shipment: Shipment) -> Shipment:
        self.db.add(shipment)
        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def update_shipment(self, shipment: Shipment) -> Shipment:
        self.db.commit()
        self.db.refresh(shipment)
        return shipment

    def create_notification(self, user_id: int, title: str, message: str, notification_type: str = "LOGISTICS") -> Notification:
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
