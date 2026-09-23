from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.models.crop import CropCategory, CropQuality, CropStatus
from app.schemas.user import UserOut


class CropBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Organic Basmati Rice"])
    category: CropCategory = Field(default=CropCategory.GRAINS, examples=["GRAINS"])
    description: Optional[str] = Field(None, max_length=1000, examples=["High quality aged basmati rice yield"])
    quantity: float = Field(..., gt=0, examples=[500.0])
    unit: str = Field(default="kg", max_length=20, examples=["kg"])
    expected_price: float = Field(..., gt=0, examples=[85.5])
    quality: CropQuality = Field(default=CropQuality.GRADE_A, examples=["GRADE_A"])
    harvest_date: date = Field(..., examples=["2026-10-15"])
    location: str = Field(..., min_length=2, max_length=150, examples=["Punjab, India"])


class CropCreate(CropBase):
    @field_validator("quantity", "expected_price")
    @classmethod
    def validate_positive_numbers(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Value must be strictly greater than 0")
        return v


class CropUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[CropCategory] = None
    description: Optional[str] = Field(None, max_length=1000)
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=20)
    expected_price: Optional[float] = Field(None, gt=0)
    quality: Optional[CropQuality] = None
    harvest_date: Optional[date] = None
    location: Optional[str] = Field(None, min_length=2, max_length=150)
    status: Optional[CropStatus] = None

    @field_validator("quantity", "expected_price")
    @classmethod
    def validate_positive_if_present(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Value must be strictly greater than 0")
        return v


class CropOut(CropBase):
    id: int
    farmer_id: int
    status: CropStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    farmer: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
