import json
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Set
from fastapi import WebSocket, HTTPException, status
from sqlalchemy.orm import Session

from app.models.shipment import Shipment, ShipmentStatus
from app.models.order import OrderStatus
from app.models.user import User, UserRole
from app.repositories.shipment_repository import ShipmentRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.tracking_repository import TrackingRepository
from app.schemas.tracking import LocationUpdate, LocationOut, TrackingSessionStatus, TrackingHistoryOut, RouteOut

logger = logging.getLogger("agrichain.tracking")


class TrackingConnectionManager:
    """
    In-memory WebSocket connection manager for live shipment tracking.
    Connections are isolated per shipment_id to ensure low latency, zero cross-shipment
    data leakage, and clean resource cleanup.
    """
    def __init__(self):
        # Maps shipment_id -> Set of active WebSocket connections
        self._active_connections: Dict[int, Set[WebSocket]] = {}
        # Tracks active live-tracking session per shipment_id
        self._active_sessions: Set[int] = set()

    async def connect(self, shipment_id: int, websocket: WebSocket):
        await websocket.accept()
        if shipment_id not in self._active_connections:
            self._active_connections[shipment_id] = set()
        self._active_connections[shipment_id].add(websocket)
        logger.info(f"[WS] Client connected to shipment {shipment_id}. Total subscribers: {len(self._active_connections[shipment_id])}")

    def disconnect(self, shipment_id: int, websocket: WebSocket):
        if shipment_id in self._active_connections:
            self._active_connections[shipment_id].discard(websocket)
            if not self._active_connections[shipment_id]:
                del self._active_connections[shipment_id]
        logger.info(f"[WS] Client disconnected from shipment {shipment_id}")

    def set_session_active(self, shipment_id: int, active: bool):
        if active:
            self._active_sessions.add(shipment_id)
        else:
            self._active_sessions.discard(shipment_id)

    def is_session_active(self, shipment_id: int) -> bool:
        return shipment_id in self._active_sessions

    async def broadcast(self, shipment_id: int, message: dict):
        if shipment_id not in self._active_connections:
            return

        dead_connections = set()
        for websocket in list(self._active_connections[shipment_id]):
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.warning(f"[WS] Error sending message to client on shipment {shipment_id}: {e}")
                dead_connections.add(websocket)

        for dead_ws in dead_connections:
            self.disconnect(shipment_id, dead_ws)


# Global singleton connection manager
tracking_ws_manager = TrackingConnectionManager()


class TrackingService:
    def __init__(self, db: Session):
        self.db = db
        self.shipment_repo = ShipmentRepository(db)
        self.order_repo = OrderRepository(db)
        self.tracking_repo = TrackingRepository(db)
        self.ws_manager = tracking_ws_manager

    def verify_shipment_access(self, user: User, shipment_id: int) -> Shipment:
        """
        Validates that the user is authorized to participate in or view live tracking.
        - Transporter: must be the assigned transporter (or Admin)
        - Farmer: must be the farmer of the underlying order
        - Buyer: must be the buyer of the underlying order
        - Admin: full operational access
        """
        shipment = self.shipment_repo.get_by_id(shipment_id)
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment #{shipment_id} not found."
            )

        if user.role == UserRole.ADMIN:
            return shipment

        if user.role == UserRole.TRANSPORTER:
            if shipment.transporter_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not assigned as the transporter for this shipment."
                )
            return shipment

        order = shipment.order
        if not order:
            order = self.order_repo.get_by_id(shipment.order_id)

        if user.role == UserRole.FARMER and order and order.farmer_id == user.id:
            return shipment

        if user.role == UserRole.BUYER and order and order.buyer_id == user.id:
            return shipment

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access live tracking for this shipment."
        )

    def verify_transporter_authority(self, user: User, shipment_id: int) -> Shipment:
        """
        Anti-spoofing check: Ensures only the assigned transporter (or Admin)
        can start/stop tracking or submit GPS coordinates.
        """
        shipment = self.verify_shipment_access(user, shipment_id)
        if user.role != UserRole.TRANSPORTER and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned transporter can manage tracking or send GPS updates."
            )
        if user.role == UserRole.TRANSPORTER and shipment.transporter_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Transporter identity does not match assigned shipment transporter."
            )
        return shipment

    async def start_tracking(self, user: User, shipment_id: int) -> TrackingSessionStatus:
        shipment = self.verify_transporter_authority(user, shipment_id)

        if shipment.shipment_status == ShipmentStatus.DELIVERED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start tracking for an already delivered shipment."
            )
        if shipment.shipment_status == ShipmentStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start tracking for a failed shipment."
            )

        # Transition status to IN_TRANSIT if currently ASSIGNED or PICKED_UP
        if shipment.shipment_status in [ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP]:
            shipment.shipment_status = ShipmentStatus.IN_TRANSIT
            self.shipment_repo.update_shipment(shipment)
            if shipment.order:
                shipment.order.status = OrderStatus.IN_TRANSIT
                self.order_repo.update_order(shipment.order)

        self.ws_manager.set_session_active(shipment_id, True)

        # Notify Farmer & Buyer
        order = shipment.order
        if order:
            self.shipment_repo.create_notification(
                user_id=order.farmer_id,
                title="Live Tracking Started",
                message=f"Transporter has started live GPS tracking for Order #{order.id} (Vehicle: {shipment.vehicle_number})."
            )
            self.shipment_repo.create_notification(
                user_id=order.buyer_id,
                title="Live Tracking Started",
                message=f"Transporter has started live GPS tracking for Order #{order.id} (Vehicle: {shipment.vehicle_number})."
            )

        # Broadcast via WebSocket
        latest_loc = self.tracking_repo.get_latest_location(shipment_id)
        await self.ws_manager.broadcast(shipment_id, {
            "type": "TRACKING_STARTED",
            "shipment_id": shipment_id,
            "shipment_status": shipment.shipment_status.value,
            "message": "Live GPS tracking started by transporter."
        })

        return TrackingSessionStatus(
            shipment_id=shipment_id,
            is_active=True,
            shipment_status=shipment.shipment_status.value,
            latest_location=LocationOut.model_validate(latest_loc) if latest_loc else None,
            message="Live GPS tracking session active."
        )

    async def stop_tracking(self, user: User, shipment_id: int) -> TrackingSessionStatus:
        shipment = self.verify_transporter_authority(user, shipment_id)
        self.ws_manager.set_session_active(shipment_id, False)

        latest_loc = self.tracking_repo.get_latest_location(shipment_id)

        await self.ws_manager.broadcast(shipment_id, {
            "type": "TRACKING_STOPPED",
            "shipment_id": shipment_id,
            "shipment_status": shipment.shipment_status.value,
            "message": "Live GPS tracking stopped by transporter."
        })

        return TrackingSessionStatus(
            shipment_id=shipment_id,
            is_active=False,
            shipment_status=shipment.shipment_status.value,
            latest_location=LocationOut.model_validate(latest_loc) if latest_loc else None,
            message="Live GPS tracking session paused."
        )

    async def record_location(self, user: User, shipment_id: int, update: LocationUpdate) -> LocationOut:
        shipment = self.verify_transporter_authority(user, shipment_id)

        if shipment.shipment_status == ShipmentStatus.DELIVERED:
            self.ws_manager.set_session_active(shipment_id, False)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipment has already been delivered. Tracking is terminated."
            )

        recorded_time = update.timestamp or datetime.now(timezone.utc)

        location = self.tracking_repo.save_location(
            shipment_id=shipment_id,
            transporter_id=shipment.transporter_id,
            latitude=update.latitude,
            longitude=update.longitude,
            accuracy=update.accuracy,
            speed=update.speed,
            heading=update.heading,
            altitude=update.altitude,
            recorded_at=recorded_time
        )

        out_loc = LocationOut.model_validate(location)

        # Broadcast real-time location to all connected viewers of this shipment
        await self.ws_manager.broadcast(shipment_id, {
            "type": "LOCATION_UPDATE",
            "shipment_id": shipment_id,
            "transporter_id": shipment.transporter_id,
            "latitude": out_loc.latitude,
            "longitude": out_loc.longitude,
            "accuracy": out_loc.accuracy,
            "speed": out_loc.speed,
            "heading": out_loc.heading,
            "altitude": out_loc.altitude,
            "recorded_at": out_loc.recorded_at.isoformat()
        })

        return out_loc

    def get_latest_location(self, user: User, shipment_id: int) -> Optional[LocationOut]:
        self.verify_shipment_access(user, shipment_id)
        latest = self.tracking_repo.get_latest_location(shipment_id)
        return LocationOut.model_validate(latest) if latest else None

    def get_history(self, user: User, shipment_id: int, limit: int = 100) -> TrackingHistoryOut:
        self.verify_shipment_access(user, shipment_id)
        pts = self.tracking_repo.get_history(shipment_id, limit=limit)
        return TrackingHistoryOut(
            shipment_id=shipment_id,
            total_points=len(pts),
            points=[LocationOut.model_validate(p) for p in pts]
        )

    async def get_route(self, user: User, shipment_id: int) -> RouteOut:
        """
        Fetch real road route between shipment pickup and destination.
        Uses geocoded coordinates on the shipment record, geocoding on-the-fly if needed.
        Calls OSRM for actual road geometry.
        Also calculates distance travelled/remaining if transporter has GPS data.
        """
        from app.services.geocoding_service import geocode_address
        from app.services.routing_service import get_road_route, calculate_distance_along_route

        shipment = self.verify_shipment_access(user, shipment_id)

        # Get or geocode pickup coordinates
        pickup_lat = shipment.pickup_lat
        pickup_lng = shipment.pickup_lng
        if not pickup_lat or not pickup_lng:
            coords = await geocode_address(shipment.pickup_address)
            if coords:
                pickup_lat, pickup_lng = coords
                shipment.pickup_lat = pickup_lat
                shipment.pickup_lng = pickup_lng
                self.db.commit()

        # Get or geocode destination coordinates
        dest_lat = shipment.destination_lat
        dest_lng = shipment.destination_lng
        if not dest_lat or not dest_lng:
            coords = await geocode_address(shipment.delivery_address)
            if coords:
                dest_lat, dest_lng = coords
                shipment.destination_lat = dest_lat
                shipment.destination_lng = dest_lng
                self.db.commit()

        # Check if we have both sets of coordinates
        if not pickup_lat or not pickup_lng:
            return RouteOut(
                shipment_id=shipment_id,
                error=f"Could not geocode pickup address: {shipment.pickup_address}"
            )

        if not dest_lat or not dest_lng:
            return RouteOut(
                shipment_id=shipment_id,
                pickup_coords=[pickup_lat, pickup_lng],
                error=f"Could not geocode destination address: {shipment.delivery_address}"
            )

        # Get road route from OSRM
        route_data = await get_road_route(pickup_lat, pickup_lng, dest_lat, dest_lng)

        if not route_data:
            return RouteOut(
                shipment_id=shipment_id,
                pickup_coords=[pickup_lat, pickup_lng],
                destination_coords=[dest_lat, dest_lng],
                error="Route calculation unavailable. Routing service did not return a valid route."
            )

        # Calculate distance progress if transporter has GPS data
        distance_travelled = None
        distance_remaining = None
        latest_loc = self.tracking_repo.get_latest_location(shipment_id)
        if latest_loc and route_data.get("geometry"):
            progress = calculate_distance_along_route(
                route_data["geometry"],
                latest_loc.latitude,
                latest_loc.longitude
            )
            if progress:
                distance_travelled = progress["distance_travelled_km"]
                distance_remaining = progress["distance_remaining_km"]

        return RouteOut(
            shipment_id=shipment_id,
            pickup_coords=[pickup_lat, pickup_lng],
            destination_coords=[dest_lat, dest_lng],
            distance_km=route_data["distance_km"],
            duration_minutes=route_data["duration_minutes"],
            geometry=route_data["geometry"],
            distance_travelled_km=distance_travelled,
            distance_remaining_km=distance_remaining
        )
