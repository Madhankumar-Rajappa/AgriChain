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


def test_notifications_flow(client):
    farmer_token = register_and_login(client, "FARMER", "f_notif1@farm.com")
    buyer_token = register_and_login(client, "BUYER", "b_notif1@shop.com")

    # Add crop
    crop_res = client.post("/api/v1/crops", json={
        "name": "Golden Turmeric",
        "category": "SPICES",
        "quantity": 100.0,
        "unit": "kg",
        "expected_price": 120.0,
        "quality": "PREMIUM",
        "harvest_date": "2026-11-10",
        "location": "Kerala"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    crop_id = crop_res.json()["id"]

    # Place order (triggers notification for farmer)
    client.post("/api/v1/orders", json={
        "crop_id": crop_id,
        "quantity": 10.0,
        "delivery_address": "Kochi Market"
    }, headers={"Authorization": f"Bearer {buyer_token}"})

    # Fetch farmer notifications
    notif_res = client.get("/api/v1/notifications/mine", headers={"Authorization": f"Bearer {farmer_token}"})
    assert notif_res.status_code == 200
    data = notif_res.json()
    assert data["unread_count"] >= 1
    assert len(data["items"]) >= 1

    first_notif_id = data["items"][0]["id"]

    # Mark single notification read
    read_res = client.patch(f"/api/v1/notifications/{first_notif_id}/read", headers={"Authorization": f"Bearer {farmer_token}"})
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # Mark all read
    mark_all_res = client.post("/api/v1/notifications/mark-all-read", headers={"Authorization": f"Bearer {farmer_token}"})
    assert mark_all_res.status_code == 200

    # Verify unread_count is 0
    final_res = client.get("/api/v1/notifications/mine", headers={"Authorization": f"Bearer {farmer_token}"})
    assert final_res.json()["unread_count"] == 0
