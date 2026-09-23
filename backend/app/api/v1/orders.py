from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.models.order import OrderStatus
from app.models.user import User, UserRole
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Order Management"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED, summary="Place Crop Order (Buyer Only)")
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.BUYER))
):
    """
    Places a crop order. Price & total amount are calculated server-side. Quantity is deducted transactionally.
    """
    service = OrderService(db)
    return service.create_order(current_user, order_in)


@router.get("/mine", summary="Get Placed Orders (Buyer)")
def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    order_status: Optional[OrderStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Returns orders placed by the currently authenticated Buyer.
    """
    service = OrderService(db)
    orders, total = service.get_buyer_orders(current_user, skip=skip, limit=limit, status=order_status)
    return {
        "items": [OrderOut.model_validate(o) for o in orders],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/incoming", summary="Get Incoming Orders (Farmer Only)")
def get_incoming_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    order_status: Optional[OrderStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Returns orders received for the authenticated Farmer's crops.
    """
    service = OrderService(db)
    orders, total = service.get_farmer_incoming_orders(current_user, skip=skip, limit=limit, status=order_status)
    return {
        "items": [OrderOut.model_validate(o) for o in orders],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{order_id}", response_model=OrderOut, summary="Get Order Details")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Returns detailed order specifications and current status.
    """
    service = OrderService(db)
    return service.get_order_by_id(current_user, order_id)


@router.post("/{order_id}/accept", response_model=OrderOut, summary="Accept Incoming Order (Farmer Only)")
def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Farmer accepts an incoming PENDING order. Transitions order status to PAYMENT_PENDING.
    """
    service = OrderService(db)
    return service.accept_order(current_user, order_id)


@router.post("/{order_id}/reject", response_model=OrderOut, summary="Reject Incoming Order (Farmer Only)")
def reject_order(
    order_id: int,
    reason: Optional[str] = Query(None, description="Optional rejection reason"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FARMER))
):
    """
    Farmer rejects a PENDING order. Transactionally restores crop stock.
    """
    service = OrderService(db)
    return service.reject_order(current_user, order_id, reason=reason)


@router.post("/{order_id}/cancel", response_model=OrderOut, summary="Cancel Eligible Order")
def cancel_order(
    order_id: int,
    reason: Optional[str] = Query(None, description="Optional cancellation reason"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancels an eligible order (PENDING or ACCEPTED). Transactionally restores crop stock.
    """
    service = OrderService(db)
    return service.cancel_order(current_user, order_id, reason=reason)
