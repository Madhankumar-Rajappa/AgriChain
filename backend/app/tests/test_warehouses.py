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
    farmer_token = register_and_login(client, "FARMER", "f_wh1@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_wh1@shop.com")

    # Add crop
    crop_res = client.post("/api/v1/crops", json={
        "name": "Basmati Rice Batch 10",
        "category": "GRAINS",
        "quantity": 5000.0,  # 5000 kg = 5 tons
        "unit": "kg",
        "expected_price": 40.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-10-20",
        "location": "Punjab"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    crop_id = crop_res.json()["id"]

    # Place order for 2000 kg (2 tons)
    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 2000.0,
        "delivery_address": "Sector 62, Mohali"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # Farmer accepts order
    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})

    # Buyer pays order
    client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_CARD"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    return farmer_token, buyer_token, order_id


def test_create_warehouse_success(client):
    wm_token = register_and_login(client, "WAREHOUSE_MANAGER", "wm1@wh.com")

    res = client.post("/api/v1/warehouses", json={
        "name": "Punjab Logistics Storage Hub",
        "location": "Ludhiana, Punjab",
        "total_capacity_tons": 100.0
    }, headers={"Authorization": f"Bearer {wm_token}"})

    assert res.status_code == 201
    wh = res.json()
    assert wh["name"] == "Punjab Logistics Storage Hub"
    assert wh["total_capacity_tons"] == 100.0
    assert wh["available_capacity_tons"] == 100.0
    assert wh["is_active"] is True


def test_create_warehouse_buyer_forbidden(client):
    buyer_token = register_and_login(client, "BUYER", "b_wh2@shop.com")

    res = client.post("/api/v1/warehouses", json={
        "name": "Unauthorized Hub",
        "location": "Delhi",
        "total_capacity_tons": 50.0
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    assert res.status_code == 403


def test_book_storage_for_paid_order_success(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)
    wm_token = register_and_login(client, "WAREHOUSE_MANAGER", "wm2@wh.com")

    # Create warehouse with 10 tons capacity
    wh_res = client.post("/api/v1/warehouses", json={
        "name": "Central Grain Storage",
        "location": "Mohali, Punjab",
        "total_capacity_tons": 10.0
    }, headers={"Authorization": f"Bearer {wm_token}"})
    wh_id = wh_res.json()["id"]

    # Book storage for order (2000 kg = 2 tons)
    book_res = client.post("/api/v1/warehouses/bookings", json={
        "order_id": order_id,
        "warehouse_id": wh_id,
        "notes": "Stored in Cold Bay 1"
    }, headers={"Authorization": f"Bearer {wm_token}"})

    assert book_res.status_code == 201
    booking = book_res.json()
    assert booking["order_id"] == order_id
    assert booking["quantity_stored"] == 2.0
    assert booking["storage_status"] == "RESERVED"

    # Check warehouse available capacity decremented from 10 to 8 tons
    wh_details = client.get(f"/api/v1/warehouses/{wh_id}").json()
    assert wh_details["available_capacity_tons"] == 8.0

    # Check order status changed to STORAGE_PENDING
    order_details = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert order_details["status"] == "STORAGE_PENDING"


def test_book_storage_unpaid_order_fails(client):
    farmer_token = register_and_login(client, "FARMER", "f_wh3@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_wh3@shop.com")
    wm_token = register_and_login(client, "WAREHOUSE_MANAGER", "wm3@wh.com")

    crop_res = client.post("/api/v1/crops", json={
        "name": "Unpaid Crop",
        "category": "GRAINS",
        "quantity": 100.0,
        "unit": "kg",
        "expected_price": 10.0,
        "quality": "GRADE_B",
        "harvest_date": "2026-10-20",
        "location": "Punjab"
    }, headers={"Authorization": f"Bearer {farmer_token}"})

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_res.json()["id"],
        "quantity": 50.0,
        "delivery_address": "123 Street"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    wh_res = client.post("/api/v1/warehouses", json={
        "name": "Storage Hub B",
        "location": "Amritsar",
        "total_capacity_tons": 50.0
    }, headers={"Authorization": f"Bearer {wm_token}"})
    wh_id = wh_res.json()["id"]

    # Attempt to book storage for unpaid order
    res = client.post("/api/v1/warehouses/bookings", json={
        "order_id": order_id,
        "warehouse_id": wh_id
    }, headers={"Authorization": f"Bearer {wm_token}"})

    assert res.status_code == 400
    assert "only be booked for PAID orders" in res.json()["detail"]


def test_update_storage_status_transitions_and_restores_capacity(client):
    farmer_token, buyer_token, order_id = setup_paid_order(client)
    wm_token = register_and_login(client, "WAREHOUSE_MANAGER", "wm4@wh.com")

    wh_res = client.post("/api/v1/warehouses", json={
        "name": "Dispatch Hub C",
        "location": "Jalandhar",
        "total_capacity_tons": 5.0
    }, headers={"Authorization": f"Bearer {wm_token}"})
    wh_id = wh_res.json()["id"]

    # Book storage (2 tons)
    book_res = client.post("/api/v1/warehouses/bookings", json={
        "order_id": order_id,
        "warehouse_id": wh_id
    }, headers={"Authorization": f"Bearer {wm_token}"})
    booking_id = book_res.json()["id"]

    # 1. Update status to STORED
    stored_res = client.patch(f"/api/v1/warehouses/bookings/{booking_id}/status", json={
        "storage_status": "STORED",
        "notes": "Verified & placed in Bay A"
    }, headers={"Authorization": f"Bearer {wm_token}"})

    assert stored_res.status_code == 200
    assert stored_res.json()["storage_status"] == "STORED"
    
    # Check order status changed to READY_FOR_PICKUP
    order_details = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert order_details["status"] == "READY_FOR_PICKUP"

    # 2. Update status to RELEASED_FOR_DISPATCH
    release_res = client.patch(f"/api/v1/warehouses/bookings/{booking_id}/status", json={
        "storage_status": "RELEASED_FOR_DISPATCH",
        "notes": "Loaded into truck"
    }, headers={"Authorization": f"Bearer {wm_token}"})

    assert release_res.status_code == 200
    assert release_res.json()["storage_status"] == "RELEASED_FOR_DISPATCH"

    # Check warehouse capacity restored back to 5 tons
    wh_details = client.get(f"/api/v1/warehouses/{wh_id}").json()
    assert wh_details["available_capacity_tons"] == 5.0

    # Check order status changed to IN_TRANSIT
    updated_order = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert updated_order["status"] == "IN_TRANSIT"
