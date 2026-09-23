from app.core.security import get_password_hash, verify_password


def test_password_hashing_and_verification():
    raw_pass = "SecretPassword123"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_user_registration_success(client):
    payload = {
        "full_name": "Farmer Joe",
        "email": "joe@farm.com",
        "password": "Password123",
        "role": "FARMER"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "joe@farm.com"
    assert data["full_name"] == "Farmer Joe"
    assert data["role"] == "FARMER"
    assert "password_hash" not in data  # Security check


def test_duplicate_email_registration_fails(client):
    payload = {
        "full_name": "Buyer Jane",
        "email": "jane@buyer.com",
        "password": "Password123",
        "role": "BUYER"
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_user_login_success_and_jwt(client):
    reg_payload = {
        "full_name": "Transporter Bob",
        "email": "bob@logistics.com",
        "password": "TruckPassword",
        "role": "TRANSPORTER"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "bob@logistics.com",
        "password": "TruckPassword"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "bob@logistics.com"


def test_login_invalid_password_fails(client):
    reg_payload = {
        "full_name": "Warehouse Manager Mary",
        "email": "mary@storage.com",
        "password": "CorrectPassword",
        "role": "WAREHOUSE_MANAGER"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {
        "email": "mary@storage.com",
        "password": "WrongPassword"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 401


def test_get_current_user_profile(client):
    reg_payload = {
        "full_name": "Admin Alice",
        "email": "admin@agrichain.com",
        "password": "AdminPassword123",
        "role": "ADMIN"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@agrichain.com",
        "password": "AdminPassword123"
    })
    token = login_res.json()["access_token"]

    profile_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert profile_res.status_code == 200
    profile = profile_res.json()
    assert profile["email"] == "admin@agrichain.com"
    assert profile["role"] == "ADMIN"


def test_role_based_access_control_rbac(client):
    client.post("/api/v1/auth/register", json={
        "full_name": "Farmer Dave",
        "email": "dave@farm.com",
        "password": "Pass12345",
        "role": "FARMER"
    })
    farmer_token = client.post("/api/v1/auth/login", json={
        "email": "dave@farm.com",
        "password": "Pass12345"
    }).json()["access_token"]

    res_farmer = client.get("/api/v1/auth/test/farmer", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_farmer.status_code == 200

    res_buyer = client.get("/api/v1/auth/test/buyer", headers={"Authorization": f"Bearer {farmer_token}"})
    assert res_buyer.status_code == 403
