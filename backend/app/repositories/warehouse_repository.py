from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.models.warehouse import Warehouse, StorageBooking, StorageStatus
from app.models.notification import Notification


class WarehouseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_warehouse_by_id(self, warehouse_id: int) -> Optional[Warehouse]:
        return self.db.scalar(
            select(Warehouse)
            .options(joinedload(Warehouse.manager))
            .where(Warehouse.id == warehouse_id)
        )

    def create_warehouse(self, warehouse: Warehouse) -> Warehouse:
        self.db.add(warehouse)
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def update_warehouse(self, warehouse: Warehouse) -> Warehouse:
        self.db.commit()
        self.db.refresh(warehouse)
        return warehouse

    def get_warehouses(
        self,
        skip: int = 0,
        limit: int = 50,
        location: Optional[str] = None,
        active_only: bool = True
    ) -> Tuple[List[Warehouse], int]:
        stmt = select(Warehouse).options(joinedload(Warehouse.manager))
        if active_only:
            stmt = stmt.where(Warehouse.is_active.is_(True))
        if location:
            stmt = stmt.where(Warehouse.location.ilike(f"%{location}%"))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        warehouses = self.db.scalars(stmt.order_by(Warehouse.created_at.desc()).offset(skip).limit(limit)).all()
        return list(warehouses), total

    def get_booking_by_id(self, booking_id: int) -> Optional[StorageBooking]:
        return self.db.scalar(
            select(StorageBooking)
            .options(
                joinedload(StorageBooking.warehouse),
                joinedload(StorageBooking.order),
                joinedload(StorageBooking.allocated_by)
            )
            .where(StorageBooking.id == booking_id)
        )

    def get_booking_by_order_id(self, order_id: int) -> Optional[StorageBooking]:
        return self.db.scalar(
            select(StorageBooking)
            .options(
                joinedload(StorageBooking.warehouse),
                joinedload(StorageBooking.order)
            )
            .where(StorageBooking.order_id == order_id)
        )

    def get_bookings(
        self,
        warehouse_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
        status: Optional[StorageStatus] = None
    ) -> Tuple[List[StorageBooking], int]:
        stmt = select(StorageBooking).options(
            joinedload(StorageBooking.warehouse),
            joinedload(StorageBooking.order)
        )
        if warehouse_id:
            stmt = stmt.where(StorageBooking.warehouse_id == warehouse_id)
        if status:
            stmt = stmt.where(StorageBooking.storage_status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        bookings = self.db.scalars(stmt.order_by(StorageBooking.created_at.desc()).offset(skip).limit(limit)).all()
        return list(bookings), total

    def create_booking(self, booking: StorageBooking) -> StorageBooking:
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def update_booking(self, booking: StorageBooking) -> StorageBooking:
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def create_notification(self, user_id: int, title: str, message: str, notification_type: str = "WAREHOUSE") -> Notification:
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
