import pytest
from app.models import Base


def register_and_login(client, role: str, email: str) -> str:
    client.post("/api/v1/auth/register", json={
        "full_name": f"Test {role}",
        "email": email,
        "password": "Password123",
        "role": role
    })
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    return res.json()["access_token"]


def create_sample_crop(client, farmer_token: str) -> int:
    crop_res = client.post("/api/v1/crops", json={
        "name": "Organic Basmati",
        "category": "GRAINS",
        "quantity": 100.0,
        "unit": "kg",
        "expected_price": 50.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-10-10",
        "location": "Punjab"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    return crop_res.json()["id"]


def test_buyer_places_order_success_deducts_stock(client):
    farmer_token = register_and_login(client, "FARMER", "f_order1@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_order1@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    # Place order for 40 kg
    order_payload = {
        "crop_id": crop_id,
        "quantity": 40.0,
        "delivery_address": "456 Market Lane, Delhi",
        "notes": "Fast delivery requested"
    }
    res = client.post("/api/v1/orders", json=order_payload, headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 201
    order = res.json()
    assert order["quantity"] == 40.0
    assert order["unit_price"] == 50.0
    assert order["total_amount"] == 2000.0  # 40 * 50
    assert order["status"] == "PENDING"

    # Verify crop quantity deducted: 100 - 40 = 60 kg remaining
    crop_details = client.get(f"/api/v1/crops/{crop_id}").json()
    assert crop_details["quantity"] == 60.0


def test_order_exceeding_stock_fails(client):
    farmer_token = register_and_login(client, "FARMER", "f_order2@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_order2@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    # Order 150 kg when only 100 kg is available
    res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 150.0,
        "delivery_address": "123 Street"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 400
    assert "exceeds available stock" in res.json()["detail"]


def test_farmer_accepts_order(client):
    farmer_token = register_and_login(client, "FARMER", "f_order3@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_order3@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 20.0,
        "delivery_address": "Address ABC"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # Farmer accepts order
    accept_res = client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "PAYMENT_PENDING"


def test_farmer_rejects_order_restores_stock(client):
    farmer_token = register_and_login(client, "FARMER", "f_order4@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_order4@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 30.0,
        "delivery_address": "Address XYZ"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # Farmer rejects order
    reject_res = client.post(f"/api/v1/orders/{order_id}/reject?reason=Out+of+season", headers={"Authorization": f"Bearer {farmer_token}"})
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"

    # Stock should be restored back to 100 kg
    crop_details = client.get(f"/api/v1/crops/{crop_id}").json()
    assert crop_details["quantity"] == 100.0


def test_buyer_cancels_order_restores_stock(client):
    farmer_token = register_and_login(client, "FARMER", "f_order5@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_order5@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 50.0,
        "delivery_address": "Address 123"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # Buyer cancels order
    cancel_res = client.post(f"/api/v1/orders/{order_id}/cancel", headers={"Authorization": f"Bearer {buyer_token}"})
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"

    # Stock restored back to 100 kg
    crop_details = client.get(f"/api/v1/crops/{crop_id}").json()
    assert crop_details["quantity"] == 100.0
