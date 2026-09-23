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


def create_sample_crop(client, farmer_token: str) -> int:
    crop_res = client.post("/api/v1/crops", json={
        "name": "Wheat Harvest",
        "category": "GRAINS",
        "quantity": 200.0,
        "unit": "kg",
        "expected_price": 30.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-10-15",
        "location": "Haryana"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    return crop_res.json()["id"]


def test_process_payment_success(client):
    farmer_token = register_and_login(client, "FARMER", "f_pay1@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_pay1@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    # 1. Place order
    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 50.0,
        "delivery_address": "789 Trade Street, Delhi"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # 2. Farmer accepts order
    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})

    # 3. Buyer processes payment
    pay_res = client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_CARD"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    assert pay_res.status_code == 201
    payment = pay_res.json()
    assert payment["order_id"] == order_id
    assert payment["amount"] == 1500.0  # 50 * 30
    assert payment["payment_status"] == "SUCCESS"
    assert payment["transaction_reference"].startswith("TXN_AGRI_")

    # 4. Verify order status changed to PAID
    updated_order = client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"}).json()
    assert updated_order["status"] == "PAID"


def test_process_payment_unaccepted_order_fails(client):
    farmer_token = register_and_login(client, "FARMER", "f_pay2@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_pay2@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    # Place order (PENDING)
    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 10.0,
        "delivery_address": "123 Address"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    # Attempt to pay without farmer acceptance
    pay_res = client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_UPI"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    assert pay_res.status_code == 400
    assert "must be accepted by farmer first" in pay_res.json()["detail"]


def test_process_payment_simulated_failure(client):
    farmer_token = register_and_login(client, "FARMER", "f_pay3@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_pay3@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    # Place and accept order
    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 20.0,
        "delivery_address": "123 Address"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]
    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})

    # Simulate payment failure
    pay_res = client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_BANK",
        "simulate_failure": True
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    assert pay_res.status_code == 400
    assert "declined by the bank" in pay_res.json()["detail"]


def test_get_payment_details_by_order_and_id(client):
    farmer_token = register_and_login(client, "FARMER", "f_pay4@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_pay4@shop.com")
    crop_id = create_sample_crop(client, farmer_token)

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 15.0,
        "delivery_address": "123 Address"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]
    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})

    pay_res = client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_WALLET"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    payment_id = pay_res.json()["id"]

    # Fetch by order_id
    by_order_res = client.get(f"/api/v1/payments/order/{order_id}", headers={"Authorization": f"Bearer {buyer_token}"})
    assert by_order_res.status_code == 200
    assert by_order_res.json()["id"] == payment_id

    # Fetch by payment_id
    by_id_res = client.get(f"/api/v1/payments/{payment_id}", headers={"Authorization": f"Bearer {buyer_token}"})
    assert by_id_res.status_code == 200
    assert by_id_res.json()["order_id"] == order_id
