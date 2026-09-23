from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.order import OrderStatus
from app.schemas.crop import CropOut
from app.schemas.user import UserOut


class OrderCreate(BaseModel):
    crop_id: int = Field(..., examples=[1])
    quantity: float = Field(..., gt=0, examples=[50.0])
    delivery_address: str = Field(..., min_length=5, max_length=500, examples=["123 Market Road, Sector 4, New Delhi"])
    notes: Optional[str] = Field(None, max_length=500, examples=["Please deliver during morning hours."])

    @field_validator("quantity")
    @classmethod
    def validate_positive_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Quantity ordered must be strictly greater than 0")
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    buyer_id: int
    farmer_id: int
    crop_id: int
    quantity: float
    unit_price: float
    total_amount: float
    status: OrderStatus
    delivery_address: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    crop: Optional[CropOut] = None
    buyer: Optional[UserOut] = None
    farmer: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
