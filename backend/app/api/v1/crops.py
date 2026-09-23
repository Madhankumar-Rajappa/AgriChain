from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.crop import CropCreate, CropOut, CropUpdate
from app.models.crop import CropCategory, CropQuality, CropStatus
from app.models.user import User, UserRole
from app.services.crop_service import CropService

router = APIRouter(prefix="/crops", tags=["Crop Management"])


@router.post("", response_model=CropOut, status_code=status.HTTP_201_CREATED, summary="Create New Crop Yield (Farmer Only)")
def create_crop(
    crop_in: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Registers a new crop yield. Restricted to authenticated Farmers.
    """
    service = CropService(db)
    return service.create_crop(current_user, crop_in)


@router.get("/mine", summary="Get Current Farmer's Crop Listings")
def get_my_crops(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    crop_status: Optional[CropStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Returns crops owned by the currently authenticated Farmer.
    """
    service = CropService(db)
    crops, total = service.get_farmer_crops(current_user, skip=skip, limit=limit, status=crop_status)
    return {
        "items": [CropOut.model_validate(c) for c in crops],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/available", summary="Browse Available Crops (Public/Buyers)")
def get_available_crops(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search crop name or description"),
    category: Optional[CropCategory] = Query(None, description="Filter by crop category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    quality: Optional[CropQuality] = Query(None, description="Filter by quality grade"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum expected price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum expected price"),
    sort_by: Optional[str] = Query("newest", description="Sort order: newest, oldest, price_asc, price_desc"),
    db: Session = Depends(get_db)
):
    """
    Browses available crop yields with search, multi-field filtering, price range bounds, sorting, and pagination.
    Inactive or sold crops are automatically excluded.
    """
    service = CropService(db)
    result = service.get_available_crops(
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
    
    return {
        "items": [CropOut.model_validate(c) for c in result["items"]],
        "total": result["total"],
        "page": result["page"],
        "page_size": result["page_size"],
        "total_pages": result["total_pages"]
    }


@router.get("/{crop_id}", response_model=CropOut, summary="Get Crop Details by ID")
def get_crop_details(crop_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed information about a specific crop yield.
    """
    service = CropService(db)
    return service.get_crop_by_id(crop_id)


@router.patch("/{crop_id}", response_model=CropOut, summary="Update Own Crop (Farmer Only)")
def update_crop(
    crop_id: int,
    crop_in: CropUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Updates crop details. Restricted to the crop's owner.
    """
    service = CropService(db)
    return service.update_crop(current_user, crop_id, crop_in)


@router.delete("/{crop_id}", response_model=CropOut, summary="Deactivate Own Crop (Farmer Only)")
def delete_crop(
    crop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Soft-deletes / deactivates a crop yield. Restricted to the crop's owner.
    """
    service = CropService(db)
    return service.delete_crop(current_user, crop_id)
