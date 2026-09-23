from datetime import datetime, timezone
import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.order import Order


class StorageStatus(str, enum.Enum):
    RESERVED = "RESERVED"
    STORED = "STORED"
    RELEASED_FOR_DISPATCH = "RELEASED_FOR_DISPATCH"


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    manager_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    total_capacity_tons: Mapped[float] = mapped_column(Float, nullable=False)
    available_capacity_tons: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    manager: Mapped[Optional["User"]] = relationship("User", foreign_keys=[manager_id])
    bookings: Mapped[List["StorageBooking"]] = relationship("StorageBooking", back_populates="warehouse", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Warehouse(id={self.id}, name='{self.name}', location='{self.location}', available={self.available_capacity_tons}/{self.total_capacity_tons})>"


class StorageBooking(Base):
    __tablename__ = "storage_bookings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False, index=True)
    allocated_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    quantity_stored: Mapped[float] = mapped_column(Float, nullable=False)
    storage_status: Mapped[StorageStatus] = mapped_column(
        SQLEnum(StorageStatus, name="storage_status_enum"),
        default=StorageStatus.RESERVED,
        nullable=False,
        index=True
    )
    entry_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    release_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    warehouse: Mapped["Warehouse"] = relationship("Warehouse", back_populates="bookings")
    allocated_by: Mapped["User"] = relationship("User", foreign_keys=[allocated_by_id])

    def __repr__(self) -> str:
        return f"<StorageBooking(id={self.id}, order_id={self.order_id}, warehouse_id={self.warehouse_id}, status='{self.storage_status}')>"
