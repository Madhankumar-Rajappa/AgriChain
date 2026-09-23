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


def test_admin_analytics_success(client):
    admin_token = register_and_login(client, "ADMIN", "admin_anal1@agrichain.com")

    res = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()

    assert "user_stats" in data
    assert "crop_stats" in data
    assert "order_stats" in data
    assert "financial_stats" in data
    assert "warehouse_stats" in data
    assert "shipment_stats" in data

    assert data["user_stats"]["admin"] >= 1
    assert data["user_stats"]["total"] >= 1


def test_admin_analytics_buyer_forbidden(client):
    buyer_token = register_and_login(client, "BUYER", "b_anal1@shop.com")

    res = client.get("/api/v1/admin/analytics", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 403
