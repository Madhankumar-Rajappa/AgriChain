from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.shipment import (
    ShipmentCreate,
    ShipmentStatusUpdate,
    ShipmentOut
)
from app.models.shipment import ShipmentStatus
from app.models.user import User, UserRole
from app.services.shipment_service import ShipmentService

router = APIRouter(prefix="/shipments", tags=["Transport & Logistics Management"])


@router.post("", response_model=ShipmentOut, status_code=status.HTTP_201_CREATED, summary="Create Shipment Dispatch (Transporter Only)")
def create_shipment(
    shipment_in: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTER, UserRole.ADMIN))
):
    """
    Creates a vehicle shipment dispatch for a paid order ready for pickup.
    """
    service = ShipmentService(db)
    return service.create_shipment(current_user, shipment_in)


@router.get("/mine", summary="Get My Assigned Shipments (Transporter Only)")
def get_my_shipments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    shipment_status: Optional[ShipmentStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTER, UserRole.ADMIN))
):
    """
    Retrieves list of active shipments assigned to the currently authenticated Transporter.
    """
    service = ShipmentService(db)
    shipments, total = service.get_transporter_shipments(current_user, skip=skip, limit=limit, status=shipment_status)
    return {
        "items": [ShipmentOut.model_validate(s) for s in shipments],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/order/{order_id}", response_model=ShipmentOut, summary="Get Shipment Details by Order ID")
def get_shipment_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves live shipment tracking information for a specific order.
    """
    service = ShipmentService(db)
    return service.get_shipment_by_order_id(current_user, order_id)


@router.get("/{shipment_id}", response_model=ShipmentOut, summary="Get Shipment Details by ID")
def get_shipment_by_id(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves details for a specific shipment.
    """
    service = ShipmentService(db)
    return service.get_shipment_by_id(current_user, shipment_id)


@router.patch("/{shipment_id}/status", response_model=ShipmentOut, summary="Update Live Shipment Status")
def update_shipment_status(
    shipment_id: int,
    status_in: ShipmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.TRANSPORTER, UserRole.ADMIN))
):
    """
    Updates live shipment delivery status (PICKED_UP, IN_TRANSIT, DELIVERED) and order status.
    """
    service = ShipmentService(db)
    return service.update_shipment_status(current_user, shipment_id, status_in)
