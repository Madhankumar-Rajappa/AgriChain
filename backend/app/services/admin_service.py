from typing import Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.user import User, UserRole
from app.models.crop import Crop, CropStatus
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.warehouse import Warehouse
from app.models.shipment import Shipment, ShipmentStatus
from app.schemas.admin import (
    AdminAnalyticsOut,
    RoleCount,
    CropStats,
    OrderStats,
    FinancialStats,
    WarehouseStats,
    ShipmentStats
)


class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def get_system_analytics(self, current_user: User) -> AdminAnalyticsOut:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Platform Administrators can access system analytics."
            )

        # 1. User Stats
        users = self.db.scalars(select(User)).all()
        role_count = RoleCount(
            farmer=sum(1 for u in users if u.role == UserRole.FARMER),
            buyer=sum(1 for u in users if u.role == UserRole.BUYER),
            transporter=sum(1 for u in users if u.role == UserRole.TRANSPORTER),
            warehouse_manager=sum(1 for u in users if u.role == UserRole.WAREHOUSE_MANAGER),
            admin=sum(1 for u in users if u.role == UserRole.ADMIN),
            total=len(users)
        )

        # 2. Crop Stats
        crops = self.db.scalars(select(Crop)).all()
        crop_stats = CropStats(
            total_crops=len(crops),
            available_crops=sum(1 for c in crops if c.status == CropStatus.AVAILABLE),
            reserved_crops=sum(1 for c in crops if c.status == CropStatus.RESERVED),
            sold_crops=sum(1 for c in crops if c.status == CropStatus.SOLD)
        )

        # 3. Order Stats
        orders = self.db.scalars(select(Order)).all()
        order_stats = OrderStats(
            total_orders=len(orders),
            pending_orders=sum(1 for o in orders if o.status == OrderStatus.PENDING),
            accepted_orders=sum(1 for o in orders if o.status == OrderStatus.ACCEPTED),
            paid_orders=sum(1 for o in orders if o.status == OrderStatus.PAID),
            in_transit_orders=sum(1 for o in orders if o.status == OrderStatus.IN_TRANSIT),
            delivered_orders=sum(1 for o in orders if o.status in [OrderStatus.DELIVERED, OrderStatus.COMPLETED]),
            cancelled_orders=sum(1 for o in orders if o.status in [OrderStatus.CANCELLED, OrderStatus.REJECTED])
        )

        # 4. Financial Stats
        paid_statuses = [
            OrderStatus.PAID, OrderStatus.STORAGE_PENDING, OrderStatus.READY_FOR_PICKUP,
            OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.COMPLETED
        ]
        total_rev = sum(o.total_amount for o in orders if o.status in paid_statuses)
        paid_order_count = sum(1 for o in orders if o.status in paid_statuses)
        avg_order_val = round(total_rev / paid_order_count, 2) if paid_order_count > 0 else 0.0

        financial_stats = FinancialStats(
            total_revenue=round(total_rev, 2),
            average_order_value=avg_order_val
        )

        # 5. Warehouse Stats
        warehouses = self.db.scalars(select(Warehouse)).all()
        total_cap = sum(w.total_capacity_tons for w in warehouses)
        avail_cap = sum(w.available_capacity_tons for w in warehouses)
        occ_cap = max(0.0, total_cap - avail_cap)
        occ_pct = round((occ_cap / total_cap * 100.0), 1) if total_cap > 0 else 0.0

        warehouse_stats = WarehouseStats(
            total_warehouses=len(warehouses),
            total_capacity_tons=round(total_cap, 2),
            available_capacity_tons=round(avail_cap, 2),
            occupied_capacity_tons=round(occ_cap, 2),
            occupancy_percentage=occ_pct
        )

        # 6. Shipment Stats
        shipments = self.db.scalars(select(Shipment)).all()
        shipment_stats = ShipmentStats(
            total_shipments=len(shipments),
            assigned_shipments=sum(1 for s in shipments if s.shipment_status == ShipmentStatus.ASSIGNED),
            in_transit_shipments=sum(1 for s in shipments if s.shipment_status in [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT]),
            delivered_shipments=sum(1 for s in shipments if s.shipment_status == ShipmentStatus.DELIVERED)
        )

        return AdminAnalyticsOut(
            user_stats=role_count,
            crop_stats=crop_stats,
            order_stats=order_stats,
            financial_stats=financial_stats,
            warehouse_stats=warehouse_stats,
            shipment_stats=shipment_stats
        )
