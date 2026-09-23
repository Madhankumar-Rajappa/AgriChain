from datetime import datetime, date, timezone
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Text, Date, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class CropCategory(str, enum.Enum):
    GRAINS = "GRAINS"
    VEGETABLES = "VEGETABLES"
    FRUITS = "FRUITS"
    PULSES = "PULSES"
    SPICES = "SPICES"
    OTHER = "OTHER"


class CropQuality(str, enum.Enum):
    GRADE_A = "GRADE_A"
    GRADE_B = "GRADE_B"
    PREMIUM = "PREMIUM"
    STANDARD = "STANDARD"


class CropStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"
    INACTIVE = "INACTIVE"


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[CropCategory] = mapped_column(
        SQLEnum(CropCategory, name="crop_category_enum"),
        default=CropCategory.GRAINS,
        nullable=False,
        index=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="kg")
    expected_price: Mapped[float] = mapped_column(Float, nullable=False)
    quality: Mapped[CropQuality] = mapped_column(
        SQLEnum(CropQuality, name="crop_quality_enum"),
        default=CropQuality.GRADE_A,
        nullable=False
    )
    harvest_date: Mapped[date] = mapped_column(Date, nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    status: Mapped[CropStatus] = mapped_column(
        SQLEnum(CropStatus, name="crop_status_enum"),
        default=CropStatus.AVAILABLE,
        nullable=False,
        index=True
    )
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

    # Relationship to farmer
    farmer: Mapped["User"] = relationship("User", back_populates="crops")

    def __repr__(self) -> str:
        return f"<Crop(id={self.id}, name='{self.name}', farmer_id={self.farmer_id}, status='{self.status}')>"
