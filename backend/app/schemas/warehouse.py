from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.warehouse import StorageStatus
from app.schemas.user import UserOut
from app.schemas.order import OrderOut


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=150, examples=["Central Punjab Cold Storage Hub"])
    location: str = Field(..., min_length=3, max_length=255, examples=["Ludhiana, Punjab"])
    total_capacity_tons: float = Field(..., gt=0, examples=[500.0])

    @field_validator("total_capacity_tons")
    @classmethod
    def validate_positive_capacity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Total warehouse capacity must be strictly greater than 0 tons")
        return v


class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=150)
    location: Optional[str] = Field(None, min_length=3, max_length=255)
    total_capacity_tons: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None


class WarehouseOut(BaseModel):
    id: int
    manager_id: Optional[int] = None
    name: str
    location: str
    total_capacity_tons: float
    available_capacity_tons: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    manager: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class StorageBookingCreate(BaseModel):
    order_id: int = Field(..., examples=[1])
    warehouse_id: int = Field(..., examples=[1])
    notes: Optional[str] = Field(None, max_length=500, examples=["Grain inspect passed. Stored in Bay 4."])


class StorageStatusUpdate(BaseModel):
    storage_status: StorageStatus
    notes: Optional[str] = Field(None, max_length=500)


class StorageBookingOut(BaseModel):
    id: int
    order_id: int
    warehouse_id: int
    allocated_by_id: int
    quantity_stored: float
    storage_status: StorageStatus
    entry_date: Optional[datetime] = None
    release_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    warehouse: Optional[WarehouseOut] = None
    order: Optional[OrderOut] = None

    model_config = ConfigDict(from_attributes=True)
