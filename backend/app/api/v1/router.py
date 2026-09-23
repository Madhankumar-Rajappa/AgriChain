from fastapi import APIRouter
from app.api.v1 import health, auth, crops, orders, payments, warehouses, shipments, admin, notifications

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health & System"])
api_router.include_router(auth.router)
api_router.include_router(crops.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(warehouses.router)
api_router.include_router(shipments.router)
api_router.include_router(admin.router)
api_router.include_router(notifications.router)




