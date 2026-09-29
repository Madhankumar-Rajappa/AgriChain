from datetime import datetime, timezone
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.shipment_repository import ShipmentRepository
from app.repositories.order_repository import OrderRepository
from app.schemas.shipment import ShipmentCreate, ShipmentStatusUpdate
from app.models.shipment import Shipment, ShipmentStatus
from app.models.order import OrderStatus
from app.models.user import User, UserRole


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ShipmentRepository(db)
        self.order_repo = OrderRepository(db)

    def create_shipment(self, current_user: User, shipment_in: ShipmentCreate) -> Shipment:
        if current_user.role != UserRole.TRANSPORTER and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Transporters or Admins can create shipment dispatches."
            )

        order = self.order_repo.get_by_id(shipment_in.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {shipment_in.order_id} not found."
            )

        valid_order_statuses = [
            OrderStatus.PAID,
            OrderStatus.STORAGE_PENDING,
            OrderStatus.READY_FOR_PICKUP,
            OrderStatus.IN_TRANSIT
        ]
        if order.status not in valid_order_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot dispatch shipment for order in status '{order.status}'. Order must be paid and ready for transport."
            )

        existing_shipment = self.repo.get_by_order_id(order.id)
        if existing_shipment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Shipment dispatch is already assigned for Order #{order.id} (Shipment #{existing_shipment.id})."
            )

        shipment = Shipment(
            order_id=order.id,
            transporter_id=current_user.id,
            warehouse_id=shipment_in.warehouse_id,
            vehicle_number=shipment_in.vehicle_number,
            driver_name=shipment_in.driver_name,
            driver_phone=shipment_in.driver_phone,
            shipment_status=ShipmentStatus.ASSIGNED,
            pickup_address=shipment_in.pickup_address,
            delivery_address=order.delivery_address,
            estimated_delivery=shipment_in.estimated_delivery,
            tracking_notes=shipment_in.tracking_notes
        )

        saved_shipment = self.repo.create_shipment(shipment)

        # Geocode addresses in the background (non-blocking, best-effort)
        try:
            from app.services.geocoding_service import geocode_address_sync
            pickup_coords = geocode_address_sync(shipment.pickup_address)
            if pickup_coords:
                saved_shipment.pickup_lat = pickup_coords[0]
                saved_shipment.pickup_lng = pickup_coords[1]

            delivery_coords = geocode_address_sync(order.delivery_address)
            if delivery_coords:
                saved_shipment.destination_lat = delivery_coords[0]
                saved_shipment.destination_lng = delivery_coords[1]

            if pickup_coords or delivery_coords:
                self.repo.update_shipment(saved_shipment)
        except Exception as e:
            import logging
            logging.getLogger("agrichain.shipment").warning(f"Geocoding during shipment creation failed (non-fatal): {e}")

        # Send notifications
        self.repo.create_notification(
            user_id=order.buyer_id,
            title="Shipment Assigned",
            message=f"Transporter assigned vehicle '{shipment.vehicle_number}' (Driver: {shipment.driver_name}) for Order #{order.id}."
        )
        self.repo.create_notification(
            user_id=order.farmer_id,
            title="Transport Dispatched",
            message=f"Vehicle '{shipment.vehicle_number}' assigned to pickup crop for Order #{order.id}."
        )

        return saved_shipment

    def update_shipment_status(self, current_user: User, shipment_id: int, status_in: ShipmentStatusUpdate) -> Shipment:
        shipment = self.repo.get_by_id(shipment_id)
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with ID {shipment_id} not found."
            )

        if shipment.transporter_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this shipment."
            )

        new_status = status_in.shipment_status
        shipment.shipment_status = new_status
        if status_in.tracking_notes:
            shipment.tracking_notes = status_in.tracking_notes

        order = shipment.order

        if new_status in [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT]:
            order.status = OrderStatus.IN_TRANSIT
            self.order_repo.update_order(order)
            self.repo.create_notification(
                user_id=order.buyer_id,
                title="Shipment In Transit",
                message=f"Order #{order.id} is picked up and in transit on vehicle {shipment.vehicle_number}."
            )

        elif new_status == ShipmentStatus.DELIVERED:
            shipment.actual_delivery = datetime.now(timezone.utc)
            order.status = OrderStatus.DELIVERED
            self.order_repo.update_order(order)
            self.repo.create_notification(
                user_id=order.buyer_id,
                title="Shipment Delivered!",
                message=f"Order #{order.id} has been safely delivered to destination address: {shipment.delivery_address}."
            )
            self.repo.create_notification(
                user_id=order.farmer_id,
                title="Crop Order Delivered",
                message=f"Order #{order.id} crop delivery verified by transporter."
            )

        return self.repo.update_shipment(shipment)

    def get_transporter_shipments(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        status: Optional[ShipmentStatus] = None
    ) -> Tuple[List[Shipment], int]:
        return self.repo.get_transporter_shipments(transporter_id=current_user.id, skip=skip, limit=limit, status=status)

    def get_shipment_by_order_id(self, current_user: User, order_id: int) -> Shipment:
        shipment = self.repo.get_by_order_id(order_id)
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No shipment dispatch details found for Order #{order_id}."
            )
        return shipment

    def get_shipment_by_id(self, current_user: User, shipment_id: int) -> Shipment:
        shipment = self.repo.get_by_id(shipment_id)
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with ID {shipment_id} not found."
            )
        return shipment
