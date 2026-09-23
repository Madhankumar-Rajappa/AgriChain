from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, require_roles
from app.schemas.payment import PaymentCreate, PaymentOut
from app.models.user import User, UserRole
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["Mock Payment Management"])


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED, summary="Process Mock Payment (Buyer Only)")
def process_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.BUYER))
):
    """
    Processes a mock payment for an accepted crop order.
    Updates order status to PAID and sends notifications to both buyer and farmer.
    """
    service = PaymentService(db)
    return service.process_payment(current_user, payment_in)


@router.get("/order/{order_id}", response_model=PaymentOut, summary="Get Payment Details by Order ID")
def get_payment_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves the payment details associated with a specific order.
    """
    service = PaymentService(db)
    return service.get_payment_by_order_id(current_user, order_id)


@router.get("/{payment_id}", response_model=PaymentOut, summary="Get Payment Details by Payment ID")
def get_payment_by_id(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves the payment details for a specific payment ID.
    """
    service = PaymentService(db)
    return service.get_payment_by_id(current_user, payment_id)
