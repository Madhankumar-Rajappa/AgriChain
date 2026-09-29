from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class LocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude between -180 and 180")
    accuracy: Optional[float] = Field(None, ge=0, description="Accuracy in meters")
    speed: Optional[float] = Field(None, ge=0, description="Speed in km/h or m/s")
    heading: Optional[float] = Field(None, ge=0, le=360, description="Compass bearing in degrees")
    altitude: Optional[float] = Field(None, description="Altitude in meters")
    timestamp: Optional[datetime] = Field(None, description="Client device timestamp")


class LocationOut(BaseModel):
    id: int
    shipment_id: int
    transporter_id: int
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    altitude: Optional[float] = None
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TrackingSessionStatus(BaseModel):
    shipment_id: int
    is_active: bool
    shipment_status: str
    latest_location: Optional[LocationOut] = None
    message: str


class TrackingHistoryOut(BaseModel):
    shipment_id: int
    total_points: int
    points: List[LocationOut]
