from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.shipment import ShipmentStatus
from app.schemas.user import UserOut
from app.schemas.order import OrderOut


class ShipmentCreate(BaseModel):
    order_id: int = Field(..., examples=[1])
    warehouse_id: Optional[int] = Field(None, examples=[1])
    vehicle_number: str = Field(..., min_length=3, max_length=50, examples=["PB-08-AB-1234"])
    driver_name: str = Field(..., min_length=2, max_length=100, examples=["Gurpreet Singh"])
    driver_phone: str = Field(..., min_length=8, max_length=20, examples=["+91-9876543210"])
    pickup_address: str = Field(..., min_length=5, max_length=500, examples=["Cold Bay 2, Ludhiana Storage Hub"])
    estimated_delivery: Optional[datetime] = Field(None, examples=["2026-10-25T14:00:00Z"])
    tracking_notes: Optional[str] = Field(None, max_length=500, examples=["Loaded onto refrigerated container"])


class ShipmentStatusUpdate(BaseModel):
    shipment_status: ShipmentStatus
    tracking_notes: Optional[str] = Field(None, max_length=500)


class ShipmentOut(BaseModel):
    id: int
    order_id: int
    transporter_id: int
    warehouse_id: Optional[int] = None
    vehicle_number: str
    driver_name: str
    driver_phone: str
    shipment_status: ShipmentStatus
    pickup_address: str
    delivery_address: str
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    tracking_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    transporter: Optional[UserOut] = None
    order: Optional[OrderOut] = None

    model_config = ConfigDict(from_attributes=True)
