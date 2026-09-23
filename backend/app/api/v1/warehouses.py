from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseOut,
    StorageBookingCreate,
    StorageBookingOut,
    StorageStatusUpdate
)
from app.models.warehouse import StorageStatus
from app.models.user import User, UserRole
from app.services.warehouse_service import WarehouseService

router = APIRouter(prefix="/warehouses", tags=["Warehouse & Storage Management"])


@router.post("", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED, summary="Create Warehouse Facility (Manager / Admin)")
def create_warehouse(
    warehouse_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN))
):
    """
    Registers a new warehouse storage facility.
    """
    service = WarehouseService(db)
    return service.create_warehouse(current_user, warehouse_in)


@router.get("", summary="List Warehouse Facilities")
def get_warehouses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    location: Optional[str] = Query(None, description="Filter by facility location"),
    db: Session = Depends(get_db)
):
    """
    Lists active warehouse facilities with location filtering and live available capacity.
    """
    service = WarehouseService(db)
    warehouses, total = service.get_warehouses(skip=skip, limit=limit, location=location)
    return {
        "items": [WarehouseOut.model_validate(w) for w in warehouses],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{warehouse_id}", response_model=WarehouseOut, summary="Get Warehouse Details")
def get_warehouse_details(
    warehouse_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns details for a specific warehouse facility.
    """
    service = WarehouseService(db)
    return service.get_warehouse_by_id(warehouse_id)


@router.post("/bookings", response_model=StorageBookingOut, status_code=status.HTTP_201_CREATED, summary="Allocate Storage Booking for Order")
def book_storage(
    booking_in: StorageBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN))
):
    """
    Allocates warehouse storage capacity for a PAID crop order.
    Deducts available capacity and transitions order status to STORAGE_PENDING.
    """
    service = WarehouseService(db)
    return service.book_storage_for_order(current_user, booking_in)


@router.get("/bookings/order/{order_id}", response_model=StorageBookingOut, summary="Get Storage Booking by Order ID")
def get_booking_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves storage booking information for a specific order.
    """
    service = WarehouseService(db)
    return service.get_booking_by_order_id(current_user, order_id)


@router.get("/bookings/list", summary="List Storage Bookings")
def list_storage_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    warehouse_id: Optional[int] = Query(None, description="Filter by warehouse ID"),
    storage_status: Optional[StorageStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN))
):
    """
    Lists storage allocations for warehouse facilities.
    """
    service = WarehouseService(db)
    bookings, total = service.get_bookings(current_user, warehouse_id=warehouse_id, skip=skip, limit=limit, storage_status=storage_status)
    return {
        "items": [StorageBookingOut.model_validate(b) for b in bookings],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.patch("/bookings/{booking_id}/status", response_model=StorageBookingOut, summary="Update Storage Status")
def update_storage_status(
    booking_id: int,
    status_in: StorageStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.WAREHOUSE_MANAGER, UserRole.ADMIN))
):
    """
    Updates storage status (STORED, RELEASED_FOR_DISPATCH). Restores warehouse capacity upon dispatch.
    """
    service = WarehouseService(db)
    return service.update_storage_status(current_user, booking_id, status_in)
