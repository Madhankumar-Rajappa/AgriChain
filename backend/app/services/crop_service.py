from typing import Optional, List, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.crop_repository import CropRepository
from app.schemas.crop import CropCreate, CropUpdate
from app.models.crop import Crop, CropCategory, CropQuality, CropStatus
from app.models.user import User, UserRole


class CropService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CropRepository(db)

    def create_crop(self, current_user: User, crop_in: CropCreate) -> Crop:
        if current_user.role != UserRole.FARMER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Farmers can list crops."
            )
        return self.repo.create(farmer_id=current_user.id, crop_in=crop_in)

    def get_crop_by_id(self, crop_id: int) -> Crop:
        crop = self.repo.get_by_id(crop_id)
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {crop_id} not found."
            )
        return crop

    def update_crop(self, current_user: User, crop_id: int, crop_in: CropUpdate) -> Crop:
        crop = self.get_crop_by_id(crop_id)
        if crop.farmer_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this crop."
            )
        return self.repo.update(crop, crop_in)

    def delete_crop(self, current_user: User, crop_id: int) -> Crop:
        crop = self.get_crop_by_id(crop_id)
        if crop.farmer_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to deactivate this crop."
            )
        return self.repo.delete_soft(crop)

    def get_farmer_crops(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        status: Optional[CropStatus] = None
    ) -> Tuple[List[Crop], int]:
        return self.repo.get_farmer_crops(farmer_id=current_user.id, skip=skip, limit=limit, status=status)

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
        return self.repo.get_available_crops(
            page=page,
            page_size=page_size,
            search=search,
            category=category,
            location=location,
            quality=quality,
            min_price=min_price,
            max_price=max_price,
            sort_by=sort_by
        )
