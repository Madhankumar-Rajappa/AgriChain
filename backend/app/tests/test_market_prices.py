import pytest
from app.services.market_price_service import MarketPriceService
from app.services.crop_image_service import CropImageService


def test_get_market_prices_default(client):
    """
    Tests fetching default market prices.
    """
    response = client.get("/api/v1/market/prices")
    assert response.status_code == 200
    data = response.json()
    assert "source" in data
    assert "markets" in data
    assert "total_markets" in data
    assert data["total_markets"] >= 1
    assert "Government of India" in data["source"]


def test_get_market_prices_with_filters(client):
    """
    Tests fetching market prices for Tomato in Tamil Nadu, Coimbatore.
    Validates min_price, max_price, modal_price, and price_per_kg formula.
    """
    response = client.get("/api/v1/market/prices", params={
        "commodity": "Tomato",
        "state": "Tamil Nadu",
        "district": "Coimbatore"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["commodity"] == "Tomato"
    assert data["state"] == "Tamil Nadu"
    assert data["district"] == "Coimbatore"
    assert data["total_markets"] >= 1

    # Verify Price per kg calculation
    for item in data["markets"]:
        assert item["commodity"].lower() == "tomato"
        assert item["state"] == "Tamil Nadu"
        assert item["district"] == "Coimbatore"
        assert item["modal_price"] > 0
        assert item["min_price"] <= item["modal_price"] <= item["max_price"]
        # 1 quintal = 100 kg => price_per_kg = modal_price / 100
        expected_per_kg = round(item["modal_price"] / 100.0, 2)
        assert item["price_per_kg"] == expected_per_kg


def test_get_market_commodities_list(client):
    """
    Tests retrieving the official commodities list.
    """
    response = client.get("/api/v1/market/commodities")
    assert response.status_code == 200
    data = response.json()
    assert "commodities" in data
    assert "total" in data
    assert data["total"] > 0
    assert "Tomato" in data["commodities"]
    assert "Onion" in data["commodities"]
    assert "Potato" in data["commodities"]
    assert "Banana" in data["commodities"]


def test_get_market_locations_hierarchy(client):
    """
    Tests retrieving state and district location hierarchy.
    """
    response = client.get("/api/v1/market/locations")
    assert response.status_code == 200
    data = response.json()
    assert "states" in data
    assert "districts_by_state" in data
    assert "markets_by_district" in data
    assert "Tamil Nadu" in data["states"]
    assert "Coimbatore" in data["districts_by_state"]["Tamil Nadu"]


def test_crop_image_service_dynamic_lookup():
    """
    Tests CropImageService dynamic lookup and caching.
    get_crop_image() now returns a dict with image_url, photographer, provider, etc.
    (Updated to match new Pexels-based image service API)
    """
    tomato_info = CropImageService.get_crop_image("Tomato")
    assert tomato_info is not None
    assert isinstance(tomato_info, dict), "get_crop_image should return a dict"
    assert "image_url" in tomato_info
    assert "provider" in tomato_info
    assert tomato_info["image_url"] is not None
    assert tomato_info["image_url"].startswith("http"), f"Expected URL, got: {tomato_info['image_url']}"
    assert tomato_info["provider"] in ("Pexels", "Wikipedia", "CDN")

    onion_info = CropImageService.get_crop_image("Onion")
    assert onion_info is not None
    assert isinstance(onion_info, dict)
    assert onion_info["image_url"].startswith("http")

    # Verify cached retrieval returns same dict
    tomato_cached = CropImageService.get_crop_image("Tomato")
    assert tomato_cached == tomato_info, "Cached result should be identical to original"

    # Verify convenience method still works
    tomato_url = CropImageService.get_crop_image_url("Tomato")
    assert tomato_url is not None
    assert tomato_url.startswith("http")



def test_market_prices_missing_or_empty_filters(client):
    """
    Tests querying non-existent filters gracefully returns empty markets list without crashing.
    """
    response = client.get("/api/v1/market/prices", params={
        "commodity": "NonExistentCrop12345",
        "state": "NonExistentState"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_markets"] == 0
    assert data["markets"] == []
