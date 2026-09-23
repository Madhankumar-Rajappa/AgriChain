from datetime import datetime, timezone
import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.payment_repository import PaymentRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.payment import PaymentCreate
from app.models.payment import Payment, PaymentStatus
from app.models.order import OrderStatus
from app.models.user import User, UserRole


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PaymentRepository(db)
        self.order_repo = OrderRepository(db)

    def process_payment(self, current_user: User, payment_in: PaymentCreate) -> Payment:
        if current_user.role != UserRole.BUYER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Buyers can process payment for orders."
            )

        order = self.order_repo.get_by_id(payment_in.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {payment_in.order_id} not found."
            )

        if order.buyer_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to pay for this order."
            )

        # Check existing payment
        existing_payment = self.repo.get_by_order_id(order.id)
        if existing_payment and existing_payment.payment_status == PaymentStatus.SUCCESS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment has already been completed for Order #{order.id}."
            )

        # Order must be in ACCEPTED or PAYMENT_PENDING state
        valid_payment_statuses = [OrderStatus.ACCEPTED, OrderStatus.PAYMENT_PENDING]
        if order.status not in valid_payment_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot process payment for Order #{order.id} with status '{order.status}'. Order must be accepted by farmer first."
            )

        txn_ref = f"TXN_AGRI_{uuid.uuid4().hex[:12].upper()}"

        if payment_in.simulate_failure:
            failed_payment = Payment(
                order_id=order.id,
                buyer_id=current_user.id,
                amount=order.total_amount,
                payment_method=payment_in.payment_method,
                payment_status=PaymentStatus.FAILED,
                transaction_reference=txn_ref,
                paid_at=None
            )
            self.repo.create_payment(failed_payment)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mock payment failed! Transaction {txn_ref} was declined by the bank."
            )

        # Successful mock payment
        payment = Payment(
            order_id=order.id,
            buyer_id=current_user.id,
            amount=order.total_amount,
            payment_method=payment_in.payment_method,
            payment_status=PaymentStatus.SUCCESS,
            transaction_reference=txn_ref,
            paid_at=datetime.now(timezone.utc)
        )
        saved_payment = self.repo.create_payment(payment)

        # Update order status to PAID
        order.status = OrderStatus.PAID
        self.order_repo.update_order(order)

        # Send notifications
        self.repo.create_notification(
            user_id=current_user.id,
            title="Payment Successful",
            message=f"Payment of ₹{order.total_amount:.2f} for Order #{order.id} was successful (Ref: {txn_ref}).",
            notification_type="PAYMENT_SUCCESS"
        )
        self.repo.create_notification(
            user_id=order.farmer_id,
            title="Payment Received",
            message=f"Buyer paid ₹{order.total_amount:.2f} for Order #{order.id} (Ref: {txn_ref}).",
            notification_type="PAYMENT_RECEIVED"
        )

        return saved_payment

    def get_payment_by_id(self, current_user: User, payment_id: int) -> Payment:
        payment = self.repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payment with ID {payment_id} not found."
            )
        
        if (
            payment.buyer_id != current_user.id
            and payment.order.farmer_id != current_user.id
            and current_user.role != UserRole.ADMIN
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this payment record."
            )
        return payment

    def get_payment_by_order_id(self, current_user: User, order_id: int) -> Payment:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found."
            )
        if (
            order.buyer_id != current_user.id
            and order.farmer_id != current_user.id
            and current_user.role != UserRole.ADMIN
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view payments for this order."
            )

        payment = self.repo.get_by_order_id(order_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No payment record found for Order #{order_id}."
            )
        return payment
