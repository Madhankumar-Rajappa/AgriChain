def get_token_for_role(client, role_name: str, email: str) -> str:
    client.post("/api/v1/auth/register", json={
        "full_name": f"Test {role_name}",
        "email": email,
        "password": "Password123",
        "role": role_name
    })
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123"})
    return res.json()["access_token"]


def test_farmer_creates_crop_success(client):
    token = get_token_for_role(client, "FARMER", "farmer1@farm.com")
    crop_payload = {
        "name": "Golden Wheat Yield",
        "category": "GRAINS",
        "description": "Premium organic wheat harvest",
        "quantity": 1000.0,
        "unit": "kg",
        "expected_price": 45.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-10-20",
        "location": "Punjab"
    }
    res = client.post("/api/v1/crops", json=crop_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Golden Wheat Yield"
    assert data["quantity"] == 1000.0
    assert data["status"] == "AVAILABLE"


def test_non_farmer_cannot_create_crop(client):
    buyer_token = get_token_for_role(client, "BUYER", "buyer1@shop.com")
    crop_payload = {
        "name": "Tomato Harvest",
        "category": "VEGETABLES",
        "quantity": 100.0,
        "unit": "kg",
        "expected_price": 20.0,
        "quality": "STANDARD",
        "harvest_date": "2026-10-01",
        "location": "Nashik"
    }
    res = client.post("/api/v1/crops", json=crop_payload, headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 403


def test_invalid_negative_quantity_validation(client):
    token = get_token_for_role(client, "FARMER", "farmer2@farm.com")
    crop_payload = {
        "name": "Invalid Crop",
        "category": "FRUITS",
        "quantity": -50.0,
        "unit": "kg",
        "expected_price": 10.0,
        "quality": "STANDARD",
        "harvest_date": "2026-10-01",
        "location": "Nagpur"
    }
    res = client.post("/api/v1/crops", json=crop_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 422


def test_farmer_views_mine_and_buyer_views_available(client):
    farmer_token = get_token_for_role(client, "FARMER", "farmer3@farm.com")
    client.post("/api/v1/crops", json={
        "name": "Organic Apples",
        "category": "FRUITS",
        "quantity": 250.0,
        "unit": "kg",
        "expected_price": 120.0,
        "quality": "PREMIUM",
        "harvest_date": "2026-11-05",
        "location": "Shimla"
    }, headers={"Authorization": f"Bearer {farmer_token}"})

    mine_res = client.get("/api/v1/crops/mine", headers={"Authorization": f"Bearer {farmer_token}"})
    assert mine_res.status_code == 200
    mine_data = mine_res.json()
    assert mine_data["total"] == 1
    assert mine_data["items"][0]["name"] == "Organic Apples"

    avail_res = client.get("/api/v1/crops/available?search=Apples")
    assert avail_res.status_code == 200
    avail_data = avail_res.json()
    assert avail_data["total"] == 1


def test_farmer_updates_own_crop_vs_other_farmer_denied(client):
    farmer1_token = get_token_for_role(client, "FARMER", "farmer4@farm.com")
    farmer2_token = get_token_for_role(client, "FARMER", "farmer5@farm.com")

    crop_res = client.post("/api/v1/crops", json={
        "name": "Corn Harvest",
        "category": "GRAINS",
        "quantity": 400.0,
        "unit": "kg",
        "expected_price": 30.0,
        "quality": "GRADE_B",
        "harvest_date": "2026-10-10",
        "location": "Haryana"
    }, headers={"Authorization": f"Bearer {farmer1_token}"})
    crop_id = crop_res.json()["id"]

    denied_update = client.patch(f"/api/v1/crops/{crop_id}", json={"expected_price": 50.0}, headers={"Authorization": f"Bearer {farmer2_token}"})
    assert denied_update.status_code == 403

    valid_update = client.patch(f"/api/v1/crops/{crop_id}", json={"expected_price": 35.0}, headers={"Authorization": f"Bearer {farmer1_token}"})
    assert valid_update.status_code == 200
    assert valid_update.json()["expected_price"] == 35.0


def test_farmer_deactivates_own_crop(client):
    farmer_token = get_token_for_role(client, "FARMER", "farmer6@farm.com")
    crop_res = client.post("/api/v1/crops", json={
        "name": "Basmati Yield",
        "category": "GRAINS",
        "quantity": 100.0,
        "unit": "kg",
        "expected_price": 90.0,
        "quality": "GRADE_A",
        "harvest_date": "2026-10-10",
        "location": "Punjab"
    }, headers={"Authorization": f"Bearer {farmer_token}"})
    crop_id = crop_res.json()["id"]

    del_res = client.delete(f"/api/v1/crops/{crop_id}", headers={"Authorization": f"Bearer {farmer_token}"})
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "INACTIVE"

    avail_res = client.get("/api/v1/crops/available")
    assert avail_res.json()["total"] == 0
