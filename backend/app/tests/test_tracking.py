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


def setup_tracking_shipment(client):
    farmer_token = register_and_login(client, "FARMER", "f_track@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_track@shop.com")
    transporter_token = register_and_login(client, "TRANSPORTER", "t_track@trans.com")

    crop_res = client.post("/api/v1/crops", json={
        "name": "Live Track Wheat",
        "category": "GRAINS",
        "quantity": 5000.0,
        "unit": "kg",
        "expected_price": 25.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-11-01",
        "location": "Punjab Farm"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    crop_id = crop_res.json()["id"]

    order_res = client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 1000.0,
        "delivery_address": "Delhi Central Mandi"
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    order_id = order_res.json()["id"]

    client.post(f"/api/v1/orders/{order_id}/accept", headers={"Authorization": f"Bearer {farmer_token}"})
    client.post("/api/v1/payments", json={
        "order_id": order_id,
        "payment_method": "MOCK_BANK"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    shipment_res = client.post("/api/v1/shipments", json={
        "order_id": order_id,
        "vehicle_number": "PB-10-TR-4433",
        "driver_name": "Gurpreet Singh",
        "driver_phone": "+91-9876543210",
        "pickup_address": "Ludhiana Farm Gate",
        "tracking_notes": "Ready for live tracking"
    }, headers={"Authorization": f"Bearer {transporter_token}"})

    shipment_id = shipment_res.json()["id"]
    return farmer_token, buyer_token, transporter_token, shipment_id


def test_start_and_stop_tracking(client):
    farmer_token, buyer_token, transporter_token, shipment_id = setup_tracking_shipment(client)

    # 1. Farmer cannot start tracking
    res_unauth = client.post(f"/api/v1/tracking/{shipment_id}/start", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_unauth.status_code == 403

    # 2. Transporter starts tracking
    res_start = client.post(f"/api/v1/tracking/{shipment_id}/start", headers={"Authorization": f"Bearer {transporter_token}"})
    assert res_start.status_code == 200
    data_start = res_start.json()
    assert data_start["is_active"] is True
    assert data_start["shipment_status"] == "IN_TRANSIT"

    # 3. Transporter submits GPS location
    loc_payload = {
        "latitude": 30.9010,
        "longitude": 75.8573,
        "accuracy": 8.5,
        "speed": 42.0,
        "heading": 135.0,
        "altitude": 245.0
    }
    res_loc = client.post(f"/api/v1/tracking/{shipment_id}/location", json=loc_payload, headers={"Authorization": f"Bearer {transporter_token}"})
    assert res_loc.status_code == 200
    loc_data = res_loc.json()
    assert loc_data["latitude"] == 30.9010
    assert loc_data["longitude"] == 75.8573
    assert loc_data["accuracy"] == 8.5

    # 4. Farmer and Buyer can fetch latest location
    res_f_lat = client.get(f"/api/v1/tracking/{shipment_id}/latest", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_f_lat.status_code == 200
    assert res_f_lat.json()["latitude"] == 30.9010

    res_b_lat = client.get(f"/api/v1/tracking/{shipment_id}/latest", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res_b_lat.status_code == 200
    assert res_b_lat.json()["latitude"] == 30.9010

    # 5. History endpoint
    res_hist = client.get(f"/api/v1/tracking/{shipment_id}/history", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res_hist.status_code == 200
    assert res_hist.json()["total_points"] >= 1

    # 6. Stop tracking
    res_stop = client.post(f"/api/v1/tracking/{shipment_id}/stop", headers={"Authorization": f"Bearer {transporter_token}"})
    assert res_stop.status_code == 200
    assert res_stop.json()["is_active"] is False


def test_anti_spoofing_other_transporter(client):
    farmer_token, buyer_token, transporter_token, shipment_id = setup_tracking_shipment(client)
    other_transporter = register_and_login(client, "TRANSPORTER", "rogue_t@fake.com")

    # Other transporter tries to start tracking or send coordinates
    res = client.post(f"/api/v1/tracking/{shipment_id}/start", headers={"Authorization": f"Bearer {other_transporter}"})
    assert res.status_code == 403

    res_loc = client.post(f"/api/v1/tracking/{shipment_id}/location", json={
        "latitude": 10.0,
        "longitude": 20.0
    }, headers={"Authorization": f"Bearer {other_transporter}"})
    assert res_loc.status_code == 403


def test_invalid_gps_coordinates_rejected(client):
    farmer_token, buyer_token, transporter_token, shipment_id = setup_tracking_shipment(client)

    # Invalid latitude > 90
    res_bad_lat = client.post(f"/api/v1/tracking/{shipment_id}/location", json={
        "latitude": 95.0,
        "longitude": 75.0
    }, headers={"Authorization": f"Bearer {transporter_token}"})
    assert res_bad_lat.status_code == 422

    # Invalid longitude < -180
    res_bad_lng = client.post(f"/api/v1/tracking/{shipment_id}/location", json={
        "latitude": 25.0,
        "longitude": -190.0
    }, headers={"Authorization": f"Bearer {transporter_token}"})
    assert res_bad_lng.status_code == 422
