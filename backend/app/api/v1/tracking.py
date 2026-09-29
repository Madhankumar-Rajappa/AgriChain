import json
import logging
from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    Query,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    status
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user
from app.db.session import SessionLocal
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.schemas.tracking import (
    LocationUpdate,
    LocationOut,
    TrackingSessionStatus,
    TrackingHistoryOut
)
from app.services.tracking_service import TrackingService, tracking_ws_manager

logger = logging.getLogger("agrichain.tracking")

router = APIRouter(prefix="/tracking", tags=["Live Shipment Tracking"])


@router.post("/{shipment_id}/start", response_model=TrackingSessionStatus, summary="Start Live Tracking (Transporter Only)")
async def start_tracking(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Transporter begins live GPS broadcast for an assigned shipment.
    Transitions status to IN_TRANSIT and notifies farmer and buyer.
    """
    service = TrackingService(db)
    return await service.start_tracking(current_user, shipment_id)


@router.post("/{shipment_id}/stop", response_model=TrackingSessionStatus, summary="Stop Live Tracking (Transporter Only)")
async def stop_tracking(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Transporter halts live GPS broadcast for a shipment.
    """
    service = TrackingService(db)
    return await service.stop_tracking(current_user, shipment_id)


@router.post("/{shipment_id}/location", response_model=LocationOut, summary="Submit GPS Location (Transporter Only)")
async def record_location(
    shipment_id: int,
    update: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    REST endpoint to submit a single device GPS point.
    Broadcasts the point in real-time to all connected WebSockets.
    """
    service = TrackingService(db)
    return await service.record_location(current_user, shipment_id, update)


@router.get("/{shipment_id}/latest", response_model=Optional[LocationOut], summary="Get Latest Location")
def get_latest_location(
    shipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves the most recent GPS coordinate recorded for this shipment.
    Accessible to Farmer, Buyer, Transporter, and Admin.
    """
    service = TrackingService(db)
    return service.get_latest_location(current_user, shipment_id)


@router.get("/{shipment_id}/history", response_model=TrackingHistoryOut, summary="Get Location History")
def get_tracking_history(
    shipment_id: int,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves recorded GPS coordinates in chronological order to render routes.
    """
    service = TrackingService(db)
    return service.get_history(current_user, shipment_id, limit=limit)


@router.websocket("/ws/{shipment_id}")
async def tracking_websocket(
    websocket: WebSocket,
    shipment_id: int,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for bidirectional live shipment tracking.
    - Requires valid JWT in query parameter '?token=<JWT>'.
    - Transporter sends periodic LOCATION_UPDATE messages.
    - Farmer, Buyer, and Transporter receive instant live updates.
    """
    # 1. Authenticate user from JWT token
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing authentication token")
        return

    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid or expired token")
        return

    email = payload.get("sub")
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)
        if not user or not user.is_active:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User inactive or not found")
            return

        service = TrackingService(db)
        # 2. Authorize access to this shipment
        try:
            shipment = service.verify_shipment_access(user, shipment_id)
        except HTTPException as exc:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=exc.detail)
            return

        # 3. Connect to WebSocket room
        await tracking_ws_manager.connect(shipment_id, websocket)

        # Send initial state
        latest_loc = service.get_latest_location(user, shipment_id)
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "shipment_id": shipment_id,
            "shipment_status": shipment.shipment_status.value,
            "is_tracking_active": tracking_ws_manager.is_session_active(shipment_id),
            "user_role": user.role.value,
            "latest_location": latest_loc.model_dump(mode="json") if latest_loc else None
        })

        # 4. Message loop
        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
            except Exception:
                await websocket.send_json({"type": "ERROR", "message": "Invalid JSON format"})
                continue

            msg_type = data.get("type")

            if msg_type == "PING":
                await websocket.send_json({"type": "PONG"})

            elif msg_type == "LOCATION_UPDATE":
                # Transporter only
                try:
                    loc_update = LocationUpdate(
                        latitude=data["latitude"],
                        longitude=data["longitude"],
                        accuracy=data.get("accuracy"),
                        speed=data.get("speed"),
                        heading=data.get("heading"),
                        altitude=data.get("altitude")
                    )
                    await service.record_location(user, shipment_id, loc_update)
                    await websocket.send_json({"type": "ACK", "status": "recorded"})
                except Exception as e:
                    logger.error(f"[WS] Error processing location update: {e}")
                    await websocket.send_json({"type": "ERROR", "message": str(e)})

            elif msg_type == "STOP_TRACKING":
                try:
                    await service.stop_tracking(user, shipment_id)
                    await websocket.send_json({"type": "ACK", "status": "stopped"})
                except Exception as e:
                    await websocket.send_json({"type": "ERROR", "message": str(e)})

    except WebSocketDisconnect:
        tracking_ws_manager.disconnect(shipment_id, websocket)
        logger.info(f"[WS] WebSocket disconnected for shipment {shipment_id}")
    except Exception as exc:
        logger.error(f"[WS] Unexpected WebSocket error: {exc}")
        tracking_ws_manager.disconnect(shipment_id, websocket)
    finally:
        db.close()
