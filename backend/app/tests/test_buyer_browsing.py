import pytest
from app.models import Base


def get_token_for_farmer(client, email: str = "farmer_browse@farm.com") -> str:
    client.post("/api/v1/auth/register", json={
        "full_name": "Browsing Test Farmer",
        "email": email,
        "password": "Password123",
        "role": "FARMER"
    })
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    return res.json()["access_token"]


def seed_crops(client, token: str):
    crops_data = [
        {"name": "Organic Basmati Rice", "category": "GRAINS", "quantity": 500.0, "unit": "kg", "expected_price": 90.0, "quality": "GRADE_A", "harvest_date": "2026-10-01", "location": "Punjab"},
        {"name": "Fresh Red Tomatoes", "category": "VEGETABLES", "quantity": 200.0, "unit": "kg", "expected_price": 25.0, "quality": "STANDARD", "harvest_date": "2026-09-20", "location": "Nashik"},
        {"name": "Alphonso Mangoes", "category": "FRUITS", "quantity": 150.0, "unit": "box", "expected_price": 450.0, "quality": "PREMIUM", "harvest_date": "2026-10-15", "location": "Ratnagiri"},
        {"name": "Organic Yellow Lentils", "category": "PULSES", "quantity": 300.0, "unit": "kg", "expected_price": 110.0, "quality": "GRADE_B", "harvest_date": "2026-10-05", "location": "Madhya Pradesh"},
    ]
    for c in crops_data:
        client.post("/api/v1/crops", json=c, headers={"Authorization": f"Bearer {token}"})


def test_marketplace_search_by_keyword(client):
    token = get_token_for_farmer(client, "f1@farm.com")
    seed_crops(client, token)

    # Search for "Basmati"
    res = client.get("/api/v1/crops/available?search=Basmati")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Organic Basmati Rice"


def test_marketplace_category_and_quality_filter(client):
    token = get_token_for_farmer(client, "f2@farm.com")
    seed_crops(client, token)

    # Filter Category = VEGETABLES
    res_veg = client.get("/api/v1/crops/available?category=VEGETABLES")
    assert res_veg.status_code == 200
    assert res_veg.json()["total"] == 1
    assert res_veg.json()["items"][0]["category"] == "VEGETABLES"

    # Filter Quality = PREMIUM
    res_prem = client.get("/api/v1/crops/available?quality=PREMIUM")
    assert res_prem.status_code == 200
    assert res_prem.json()["total"] == 1
    assert res_prem.json()["items"][0]["quality"] == "PREMIUM"


def test_marketplace_price_range_filtering(client):
    token = get_token_for_farmer(client, "f3@farm.com")
    seed_crops(client, token)

    # Price range min=50, max=200 -> expected matches: Rice (90) and Lentils (110)
    res = client.get("/api/v1/crops/available?min_price=50&max_price=200")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    prices = [item["expected_price"] for item in data["items"]]
    assert 90.0 in prices
    assert 110.0 in prices


def test_marketplace_price_sorting(client):
    token = get_token_for_farmer(client, "f4@farm.com")
    seed_crops(client, token)

    # Price Ascending
    res_asc = client.get("/api/v1/crops/available?sort_by=price_asc")
    assert res_asc.status_code == 200
    items_asc = res_asc.json()["items"]
    assert items_asc[0]["expected_price"] == 25.0  # Tomatoes lowest

    # Price Descending
    res_desc = client.get("/api/v1/crops/available?sort_by=price_desc")
    assert res_desc.status_code == 200
    items_desc = res_desc.json()["items"]
    assert items_desc[0]["expected_price"] == 450.0  # Mangoes highest


def test_marketplace_pagination_metadata(client):
    token = get_token_for_farmer(client, "f5@farm.com")
    seed_crops(client, token)

    # Page size 2
    res = client.get("/api/v1/crops/available?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 4
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 2
    assert len(data["items"]) == 2
