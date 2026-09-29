from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Float, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.shipment import Shipment


class ShipmentLocation(Base):
    __tablename__ = "shipment_locations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    transporter_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    accuracy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in meters
    speed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)     # in km/h or m/s
    heading: Mapped[Optional[float]] = mapped_column(Float, nullable=True)   # compass degrees 0-360
    altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # in meters

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationships
    shipment: Mapped["Shipment"] = relationship("Shipment")
    transporter: Mapped["User"] = relationship("User", foreign_keys=[transporter_id])

    __table_args__ = (
        Index("ix_shipment_locations_shipment_recorded", "shipment_id", "recorded_at"),
    )

    def __repr__(self) -> str:
        return f"<ShipmentLocation(id={self.id}, shipment_id={self.shipment_id}, lat={self.latitude}, lng={self.longitude}, recorded_at={self.recorded_at})>"
