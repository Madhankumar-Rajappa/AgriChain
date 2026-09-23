from datetime import datetime, timezone
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.order import Order
    from app.models.warehouse import Warehouse


class ShipmentStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    transporter_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    warehouse_id: Mapped[Optional[int]] = mapped_column(ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True, index=True)

    vehicle_number: Mapped[str] = mapped_column(String(50), nullable=False)
    driver_name: Mapped[str] = mapped_column(String(100), nullable=False)
    driver_phone: Mapped[str] = mapped_column(String(20), nullable=False)

    shipment_status: Mapped[ShipmentStatus] = mapped_column(
        SQLEnum(ShipmentStatus, name="shipment_status_enum"),
        default=ShipmentStatus.ASSIGNED,
        nullable=False,
        index=True
    )

    pickup_address: Mapped[str] = mapped_column(Text, nullable=False)
    delivery_address: Mapped[str] = mapped_column(Text, nullable=False)

    estimated_delivery: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_delivery: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    tracking_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True
    )

    # Relationships
    order: Mapped["Order"] = relationship("Order")
    transporter: Mapped["User"] = relationship("User", foreign_keys=[transporter_id])
    warehouse: Mapped[Optional["Warehouse"]] = relationship("Warehouse")

    def __repr__(self) -> str:
        return f"<Shipment(id={self.id}, order_id={self.order_id}, vehicle='{self.vehicle_number}', status='{self.shipment_status}')>"
