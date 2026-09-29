from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.shipment_location import ShipmentLocation


class TrackingRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_location(
        self,
        shipment_id: int,
        transporter_id: int,
        latitude: float,
        longitude: float,
        accuracy: Optional[float] = None,
        speed: Optional[float] = None,
        heading: Optional[float] = None,
        altitude: Optional[float] = None,
        recorded_at: Optional[datetime] = None
    ) -> ShipmentLocation:
        if recorded_at is None:
            recorded_at = datetime.now(timezone.utc)

        location = ShipmentLocation(
            shipment_id=shipment_id,
            transporter_id=transporter_id,
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
            speed=speed,
            heading=heading,
            altitude=altitude,
            recorded_at=recorded_at
        )
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location

    def get_latest_location(self, shipment_id: int) -> Optional[ShipmentLocation]:
        stmt = (
            select(ShipmentLocation)
            .where(ShipmentLocation.shipment_id == shipment_id)
            .order_by(desc(ShipmentLocation.recorded_at), desc(ShipmentLocation.id))
            .limit(1)
        )
        return self.db.scalar(stmt)

    def get_history(self, shipment_id: int, limit: int = 100) -> List[ShipmentLocation]:
        stmt = (
            select(ShipmentLocation)
            .where(ShipmentLocation.shipment_id == shipment_id)
            .order_by(desc(ShipmentLocation.recorded_at), desc(ShipmentLocation.id))
            .limit(limit)
        )
        results = self.db.scalars(stmt).all()
        # Return in ascending chronological order for polyline drawing
        return list(reversed(results))
