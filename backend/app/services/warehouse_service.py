from datetime import datetime, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.warehouse_repository import WarehouseRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, StorageBookingCreate, StorageStatusUpdate
from app.models.warehouse import Warehouse, StorageBooking, StorageStatus
from app.models.order import OrderStatus
from app.models.user import User, UserRole


class WarehouseService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WarehouseRepository(db)
        self.order_repo = OrderRepository(db)

    def create_warehouse(self, current_user: User, warehouse_in: WarehouseCreate) -> Warehouse:
        if current_user.role != UserRole.WAREHOUSE_MANAGER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Warehouse Managers or Admins can create storage facilities."
            )

        warehouse = Warehouse(
            manager_id=current_user.id,
            name=warehouse_in.name,
            location=warehouse_in.location,
            total_capacity_tons=warehouse_in.total_capacity_tons,
            available_capacity_tons=warehouse_in.total_capacity_tons,
            is_active=True
        )
        return self.repo.create_warehouse(warehouse)

    def get_warehouses(
        self,
        skip: int = 0,
        limit: int = 50,
        location: Optional[str] = None
    ) -> Tuple[List[Warehouse], int]:
        return self.repo.get_warehouses(skip=skip, limit=limit, location=location)

    def get_warehouse_by_id(self, warehouse_id: int) -> Warehouse:
        facility = self.repo.get_warehouse_by_id(warehouse_id)
        if not facility:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse facility with ID {warehouse_id} not found."
            )
        return facility

    def book_storage_for_order(self, current_user: User, booking_in: StorageBookingCreate) -> StorageBooking:
        if current_user.role != UserRole.WAREHOUSE_MANAGER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Warehouse Managers or Admins can allocate storage space."
            )

        order = self.order_repo.get_by_id(booking_in.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {booking_in.order_id} not found."
            )

        if order.status != OrderStatus.PAID:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Storage space can only be booked for PAID orders. Current order status: '{order.status}'."
            )

        existing_booking = self.repo.get_booking_by_order_id(order.id)
        if existing_booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Storage is already allocated for Order #{order.id} (Booking #{existing_booking.id})."
            )

        warehouse = self.repo.get_warehouse_by_id(booking_in.warehouse_id)
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Warehouse facility with ID {booking_in.warehouse_id} not found."
            )

        if not warehouse.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Warehouse '{warehouse.name}' is currently inactive."
            )

        # Calculate tonnage (convert kg to tons, minimum 0.01 tons)
        quantity_tons = max(0.01, round(order.quantity / 1000.0, 3))
        if quantity_tons > warehouse.available_capacity_tons:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available capacity in '{warehouse.name}'. Required: {quantity_tons} tons, Available: {warehouse.available_capacity_tons} tons."
            )

        # Deduct available capacity
        warehouse.available_capacity_tons -= quantity_tons
        self.repo.update_warehouse(warehouse)

        # Transition order status to STORAGE_PENDING
        order.status = OrderStatus.STORAGE_PENDING
        self.order_repo.update_order(order)

        booking = StorageBooking(
            order_id=order.id,
            warehouse_id=warehouse.id,
            allocated_by_id=current_user.id,
            quantity_stored=quantity_tons,
            storage_status=StorageStatus.RESERVED,
            notes=booking_in.notes
        )
        saved_booking = self.repo.create_booking(booking)

        # Send notifications to Buyer & Farmer
        self.repo.create_notification(
            user_id=order.buyer_id,
            title="Storage Reserved",
            message=f"Storage space of {quantity_tons} tons reserved at '{warehouse.name}' for Order #{order.id}."
        )
        self.repo.create_notification(
            user_id=order.farmer_id,
            title="Storage Reserved",
            message=f"Crop for Order #{order.id} scheduled for arrival at '{warehouse.name}'."
        )

        return saved_booking

    def update_storage_status(self, current_user: User, booking_id: int, status_in: StorageStatusUpdate) -> StorageBooking:
        if current_user.role != UserRole.WAREHOUSE_MANAGER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Warehouse Managers or Admins can update storage statuses."
            )

        booking = self.repo.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Storage booking with ID {booking_id} not found."
            )

        new_status = status_in.storage_status
        old_status = booking.storage_status

        booking.storage_status = new_status
        if status_in.notes:
            booking.notes = status_in.notes

        if new_status == StorageStatus.STORED and old_status != StorageStatus.STORED:
            booking.entry_date = datetime.now(timezone.utc)
            booking.order.status = OrderStatus.READY_FOR_PICKUP
            self.order_repo.update_order(booking.order)
            self.repo.create_notification(
                user_id=booking.order.buyer_id,
                title="Crop Stored in Warehouse",
                message=f"Order #{booking.order_id} crop received and verified at '{booking.warehouse.name}'. Ready for transport pickup!"
            )

        elif new_status == StorageStatus.RELEASED_FOR_DISPATCH and old_status != StorageStatus.RELEASED_FOR_DISPATCH:
            booking.release_date = datetime.now(timezone.utc)
            # Restore capacity to warehouse
            warehouse = booking.warehouse
            warehouse.available_capacity_tons = min(warehouse.total_capacity_tons, warehouse.available_capacity_tons + booking.quantity_stored)
            self.repo.update_warehouse(warehouse)

            booking.order.status = OrderStatus.IN_TRANSIT
            self.order_repo.update_order(booking.order)
            self.repo.create_notification(
                user_id=booking.order.buyer_id,
                title="Crop Released for Dispatch",
                message=f"Order #{booking.order_id} released from '{booking.warehouse.name}' for transport dispatch."
            )

        return self.repo.update_booking(booking)

    def get_booking_by_order_id(self, current_user: User, order_id: int) -> StorageBooking:
        booking = self.repo.get_booking_by_order_id(order_id)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No storage booking found for Order #{order_id}."
            )
        return booking

    def get_bookings(
        self,
        current_user: User,
        warehouse_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
        storage_status: Optional[StorageStatus] = None
    ) -> Tuple[List[StorageBooking], int]:
        return self.repo.get_bookings(warehouse_id=warehouse_id, skip=skip, limit=limit, status=storage_status)
