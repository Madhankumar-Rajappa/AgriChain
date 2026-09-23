import pytest


def register_and_login(client, role: str, email: str) -> str:
    client.post("/api/v1/auth/register", json={
        "full_name": f"Test {role}",
        "email": email,
        "password": "Password123",
        "role": role
    })
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    return res.json()["access_token"]


def setup_paid_order(client):
    farmer_token = register_and_login(client, "FARMER", "f_ship1@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_ship1@shop.com")

    crop_res = client.post("/api/v1/crops", json={
        "name": "Organic Sugarcane",
        "category": "GRAINS",
        "quantity": 10000.0,
        "unit": "kg",
        "expected_price": 5.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-11-01",
        "location": "UP East"
    }, headers={"Authorization": f"Bearer {farmer_token}"})

    crop_id = crop_res.json()["id"]

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 2000.0,
        "delivery_address": "Factory Gate 4, Meerut"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})
    client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_BANK"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    return farmer_token, buyer_token, order_id


def test_create_shipment_success(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)
    transporter_token = register_and_login(client, "TRANSPORTER", "t_ship1@trans.com")

    res = client.post("/api/v1/shipments", json={
        "order_id": order_id,
        "vehicle_number": "UP-15-AT-9988",
        "driver_name": "Ramesh Kumar",
        "driver_phone": "+91-9988776655",
        "pickup_address": "Meerut Agro Mandi",
        "tracking_notes": "Heavy vehicle container loaded"
    }, headers={"Authorization": f"Bearer {transporter_token}"})

    assert res.status_code == 201
    shipment = res.json()
    assert shipment["order_id"] == order_id
    assert shipment["vehicle_number"] == "UP-15-AT-9988"
    assert shipment["shipment_status"] == "ASSIGNED"


def test_create_shipment_buyer_forbidden(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)

    res = client.post("/api/v1/shipments", json={
        "order_id": order_id,
        "vehicle_number": "DL-01-XX-0000",
        "driver_name": "Unauthorized Driver",
        "driver_phone": "+91-0000000000",
        "pickup_address": "Address"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    assert res.status_code == 403


def test_update_shipment_status_picked_up_and_delivered(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)
    transporter_token = register_and_login(client, "TRANSPORTER", "t_ship2@trans.com")

    ship_res = client.post("/api/v1/shipments", json={
        "order_id": order_id,
        "vehicle_number": "HR-26-CP-1122",
        "driver_name": "Sukhdev Singh",
        "driver_phone": "+91-9812345678",
        "pickup_address": "Karnal Farm Bay 1"
    }, headers={"Authorization": f"Bearer {transporter_token}"})
    shipment_id = ship_res.json()["id"]

    # 1. Update status to PICKED_UP
    pickup_res = client.patch(f"/api/v1/shipments/{shipment_id}/status", json={
        "shipment_status": "PICKED_UP",
        "tracking_notes": "Departed warehouse location"
    }, headers={"Authorization": f"Bearer {transporter_token}"})

    assert pickup_res.status_code == 200
    assert pickup_res.json()["shipment_status"] == "PICKED_UP"

    # Verify order status updated to IN_TRANSIT
    order_details = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert order_details["status"] == "IN_TRANSIT"

    # 2. Update status to DELIVERED
    delivered_res = client.patch(f"/api/v1/shipments/{shipment_id}/status", json={
        "shipment_status": "DELIVERED",
        "tracking_notes": "Delivered to buyer dock. Signature collected."
    }, headers={"Authorization": f"Bearer {transporter_token}"})

    assert delivered_res.status_code == 200
    delivered = delivered_res.json()
    assert delivered["shipment_status"] == "DELIVERED"
    assert delivered["actual_delivery"] is not None

    # Verify order status updated to DELIVERED
    final_order = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert final_order["status"] == "DELIVERED"


def test_get_shipment_by_order_id(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)
    transporter_token = register_and_login(client, "TRANSPORTER", "t_ship3@trans.com")

    ship_res = client.post("/api/v1/shipments", json={
        "order_id": order_id,
        "vehicle_number": "PB-10-AB-5555",
        "driver_name": "Balwinder Singh",
        "driver_phone": "+91-9871122334",
        "pickup_address": "Ludhiana Storage"
    }, headers={"Authorization": f"Bearer {transporter_token}"})
    shipment_id = ship_res.json()["id"]

    # Fetch shipment by order ID
    res = client.get(f"/api/v1/shipments/order/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 200
    assert res.json()["id"] == shipment_id
    assert res.json()["vehicle_number"] == "PB-10-AB-5555"
