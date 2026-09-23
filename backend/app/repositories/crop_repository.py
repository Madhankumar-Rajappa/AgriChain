import math
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, or_
from app.models.crop import Crop, CropCategory, CropQuality, CropStatus
from app.schemas.crop import CropCreate, CropUpdate


class CropRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, crop_id: int) -> Optional[Crop]:
        return self.db.scalar(
            select(Crop)
            .options(joinedload(Crop.farmer))
            .where(Crop.id == crop_id)
        )

    def create(self, farmer_id: int, crop_in: CropCreate) -> Crop:
        crop = Crop(
            farmer_id=farmer_id,
            name=crop_in.name,
            category=crop_in.category,
            description=crop_in.description,
            quantity=crop_in.quantity,
            unit=crop_in.unit,
            expected_price=crop_in.expected_price,
            quality=crop_in.quality,
            harvest_date=crop_in.harvest_date,
            location=crop_in.location,
            status=CropStatus.AVAILABLE
        )
        self.db.add(crop)
        self.db.commit()
        self.db.refresh(crop)
        return crop

    def update(self, crop: Crop, crop_in: CropUpdate) -> Crop:
        update_data = crop_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(crop, field, value)
        self.db.commit()
        self.db.refresh(crop)
        return crop

    def delete_soft(self, crop: Crop) -> Crop:
        crop.status = CropStatus.INACTIVE
        self.db.commit()
        self.db.refresh(crop)
        return crop

    def get_farmer_crops(
        self,
        farmer_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[CropStatus] = None
    ) -> Tuple[List[Crop], int]:
        stmt = select(Crop).options(joinedload(Crop.farmer)).where(Crop.farmer_id == farmer_id)
        if status:
            stmt = stmt.where(Crop.status == status)
        
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0
        
        crops = self.db.scalars(stmt.order_by(Crop.created_at.desc()).offset(skip).limit(limit)).all()
        return list(crops), total

    def get_available_crops(
        self,
        page: int = 1,
        page_size: int = 12,
        search: Optional[str] = None,
        category: Optional[CropCategory] = None,
        location: Optional[str] = None,
        quality: Optional[CropQuality] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: Optional[str] = "newest"
    ) -> Dict[str, Any]:
        stmt = select(Crop).options(joinedload(Crop.farmer)).where(Crop.status == CropStatus.AVAILABLE)
        
        if search and search.strip():
            term = f"%{search.strip()}%"
            stmt = stmt.where(or_(Crop.name.ilike(term), Crop.description.ilike(term)))
        if category:
            stmt = stmt.where(Crop.category == category)
        if location and location.strip():
            stmt = stmt.where(Crop.location.ilike(f"%{location.strip()}%"))
        if quality:
            stmt = stmt.where(Crop.quality == quality)
        if min_price is not None:
            stmt = stmt.where(Crop.expected_price >= min_price)
        if max_price is not None:
            stmt = stmt.where(Crop.expected_price <= max_price)

        # Count total matching rows
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        # Sorting
        if sort_by == "price_asc":
            stmt = stmt.order_by(Crop.expected_price.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(Crop.expected_price.desc())
        elif sort_by == "oldest":
            stmt = stmt.order_by(Crop.created_at.asc())
        else:  # "newest" default
            stmt = stmt.order_by(Crop.created_at.desc())

        # Pagination offsets
        skip = (page - 1) * page_size
        stmt = stmt.offset(skip).limit(page_size)
        crops = list(self.db.scalars(stmt).all())

        total_pages = math.ceil(total / page_size) if page_size > 0 else 1

        return {
            "items": crops,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, total_pages)
        }
