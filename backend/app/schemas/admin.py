from pydantic import BaseModel, ConfigDict
from typing import Dict, Any


class RoleCount(BaseModel):
    farmer: int = 0
    buyer: int = 0
    transporter: int = 0
    warehouse_manager: int = 0
    admin: int = 0
    total: int = 0


class CropStats(BaseModel):
    total_crops: int = 0
    available_crops: int = 0
    reserved_crops: int = 0
    sold_crops: int = 0


class OrderStats(BaseModel):
    total_orders: int = 0
    pending_orders: int = 0
    accepted_orders: int = 0
    paid_orders: int = 0
    in_transit_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0


class FinancialStats(BaseModel):
    total_revenue: float = 0.0
    average_order_value: float = 0.0


class WarehouseStats(BaseModel):
    total_warehouses: int = 0
    total_capacity_tons: float = 0.0
    available_capacity_tons: float = 0.0
    occupied_capacity_tons: float = 0.0
    occupancy_percentage: float = 0.0


class ShipmentStats(BaseModel):
    total_shipments: int = 0
    assigned_shipments: int = 0
    in_transit_shipments: int = 0
    delivered_shipments: int = 0


class AdminAnalyticsOut(BaseModel):
    user_stats: RoleCount
    crop_stats: CropStats
    order_stats: OrderStats
    financial_stats: FinancialStats
    warehouse_stats: WarehouseStats
    shipment_stats: ShipmentStats

    model_config = ConfigDict(from_attributes=True)
