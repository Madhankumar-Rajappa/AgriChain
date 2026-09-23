from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.order_repository import OrderRepository
from app.repositories.crop_repository import CropRepository
from app.schemas.order import OrderCreate
from app.models.order import Order, OrderStatus
from app.models.crop import Crop, CropStatus
from app.models.user import User, UserRole


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)
        self.crop_repo = CropRepository(db)

    def create_order(self, current_user: User, order_in: OrderCreate) -> Order:
        if current_user.role != UserRole.BUYER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Buyers can place crop orders."
            )

        crop = self.crop_repo.get_by_id(order_in.crop_id)
        if not crop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop with ID {order_in.crop_id} not found."
            )

        if crop.status != CropStatus.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Crop '{crop.name}' is currently not available for purchase (status: {crop.status})."
            )

        if order_in.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity ordered must be greater than zero."
            )

        if order_in.quantity > crop.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({order_in.quantity} {crop.unit}) exceeds available stock ({crop.quantity} {crop.unit})."
            )

        unit_price = crop.expected_price
        total_amount = round(order_in.quantity * unit_price, 2)

        # Transactional crop quantity deduction
        crop.quantity -= order_in.quantity
        if crop.quantity <= 0:
            crop.quantity = 0
            crop.status = CropStatus.RESERVED

        new_order = Order(
            buyer_id=current_user.id,
            farmer_id=crop.farmer_id,
            crop_id=crop.id,
            quantity=order_in.quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            status=OrderStatus.PENDING,
            delivery_address=order_in.delivery_address,
            notes=order_in.notes
        )

        saved_order = self.repo.create_order(new_order)

        # Send in-app notification to farmer
        self.repo.create_notification(
            user_id=crop.farmer_id,
            title="New Order Received",
            message=f"Buyer '{current_user.full_name}' placed an order for {order_in.quantity} {crop.unit} of '{crop.name}' (Total: ₹{total_amount}).",
            notification_type="ORDER_NEW"
        )

        return saved_order

    def get_order_by_id(self, current_user: User, order_id: int) -> Order:
        order = self.repo.get_by_id(order_id)
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
                detail="You do not have permission to view this order."
            )
        return order

    def accept_order(self, current_user: User, order_id: int) -> Order:
        order = self.get_order_by_id(current_user, order_id)
        if order.farmer_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the crop owner farmer can accept incoming orders."
            )

        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept order in status '{order.status}'. Order must be PENDING."
            )

        order.status = OrderStatus.PAYMENT_PENDING
        updated = self.repo.update_order(order)

        self.repo.create_notification(
            user_id=order.buyer_id,
            title="Order Accepted by Farmer",
            message=f"Farmer accepted your order #{order.id} for '{order.crop.name}'. Please complete mock payment.",
            notification_type="ORDER_ACCEPTED"
        )
        return updated

    def reject_order(self, current_user: User, order_id: int, reason: Optional[str] = None) -> Order:
        order = self.get_order_by_id(current_user, order_id)
        if order.farmer_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the crop owner farmer can reject incoming orders."
            )

        if order.status != OrderStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject order in status '{order.status}'. Order must be PENDING."
            )

        # Restore crop quantity
        crop = order.crop
        crop.quantity += order.quantity
        if crop.status == CropStatus.RESERVED or crop.status == CropStatus.INACTIVE:
            crop.status = CropStatus.AVAILABLE

        order.status = OrderStatus.REJECTED
        if reason:
            order.notes = f"{order.notes or ''} [Rejection Reason: {reason}]".strip()

        updated = self.repo.update_order(order)

        self.repo.create_notification(
            user_id=order.buyer_id,
            title="Order Rejected",
            message=f"Farmer was unable to accept your order #{order.id} for '{crop.name}'.",
            notification_type="ORDER_REJECTED"
        )
        return updated

    def cancel_order(self, current_user: User, order_id: int, reason: Optional[str] = None) -> Order:
        order = self.get_order_by_id(current_user, order_id)
        
        eligible_statuses = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PAYMENT_PENDING]
        if order.status not in eligible_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order in status '{order.status}' cannot be cancelled."
            )

        # Restore crop quantity
        crop = order.crop
        crop.quantity += order.quantity
        if crop.status == CropStatus.RESERVED:
            crop.status = CropStatus.AVAILABLE

        order.status = OrderStatus.CANCELLED
        if reason:
            order.notes = f"{order.notes or ''} [Cancelled by {current_user.full_name}: {reason}]".strip()

        updated = self.repo.update_order(order)

        # Notify counterparty
        notify_user_id = order.farmer_id if current_user.id == order.buyer_id else order.buyer_id
        self.repo.create_notification(
            user_id=notify_user_id,
            title="Order Cancelled",
            message=f"Order #{order.id} for '{crop.name}' has been cancelled.",
            notification_type="ORDER_CANCELLED"
        )
        return updated

    def get_buyer_orders(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        status: Optional[OrderStatus] = None
    ) -> Tuple[List[Order], int]:
        return self.repo.get_buyer_orders(buyer_id=current_user.id, skip=skip, limit=limit, status=status)

    def get_farmer_incoming_orders(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        status: Optional[OrderStatus] = None
    ) -> Tuple[List[Order], int]:
        return self.repo.get_farmer_incoming_orders(farmer_id=current_user.id, skip=skip, limit=limit, status=status)
