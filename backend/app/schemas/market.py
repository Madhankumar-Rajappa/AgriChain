"""
Market Price Pydantic Schemas — AgriChain

Defines request/response models for the /api/v1/market/* endpoints.
"""
from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class CropImageInfo(BaseModel):
    """Attribution-complete image record returned alongside each market response."""
    image_url: Optional[str] = Field(None, description="Direct URL to the crop photograph (use as img src)")
    photo_url: Optional[str] = Field(None, description="Link to the original photo page (for attribution)")
    photographer: Optional[str] = Field(None, description="Photographer or image source name")
    photographer_url: Optional[str] = Field(None, description="URL to photographer's profile/page")
    provider: Optional[str] = Field(None, description="Image provider: 'Pexels', 'Wikipedia', or 'CDN'")


class MarketItem(BaseModel):
    market: str = Field(..., description="Name of the agricultural mandi/market")
    state: str = Field(..., description="State where market is located")
    district: str = Field(..., description="District where market is located")
    commodity: str = Field(..., description="Agricultural commodity name")
    variety: Optional[str] = Field(None, description="Crop variety or grade (e.g. Local, Hybrid, Desi)")
    arrival_date: str = Field(..., description="Date of market price report (YYYY-MM-DD)")
    min_price: float = Field(..., description="Minimum reported price per quintal in INR (₹)")
    max_price: float = Field(..., description="Maximum reported price per quintal in INR (₹)")
    modal_price: float = Field(..., description="Modal (most common) price per quintal in INR (₹)")
    unit: str = Field("quintal", description="Unit of measurement reported by mandi (always quintal = 100 kg)")
    price_per_kg: float = Field(..., description="Calculated approximate price per kilogram (modal_price / 100)")

    # Per-item image info (same image used for all items of same commodity)
    image_url: Optional[str] = Field(None, description="Dynamically resolved crop photograph URL")
    photo_url: Optional[str] = Field(None, description="Link to original photo page (for attribution)")
    photographer: Optional[str] = Field(None, description="Photographer name (Pexels attribution)")
    photographer_url: Optional[str] = Field(None, description="Photographer profile URL (Pexels attribution)")
    image_provider: Optional[str] = Field(None, description="Image source: 'Pexels', 'Wikipedia', or 'CDN'")


class MarketPricesResponse(BaseModel):
    commodity: Optional[str] = Field(None, description="Filtered commodity name")

    # Top-level image attribution (resolved once per commodity for all market cards)
    image: Optional[CropImageInfo] = Field(None, description="Dynamically resolved crop image with full attribution")

    state: Optional[str] = Field(None, description="Filtered state")
    district: Optional[str] = Field(None, description="Filtered district")
    market: Optional[str] = Field(None, description="Filtered specific market name")
    date: Optional[str] = Field(None, description="Reporting date of the market dataset")
    source: str = Field(
        "Government of India / Directorate of Marketing and Inspection (OGD)",
        description="Official origin and transparency source of the market data"
    )
    last_updated: Optional[str] = Field(None, description="Timestamp of data resolution (ISO 8601)")
    total_markets: int = Field(..., description="Total matching market centers returned")
    markets: List[MarketItem] = Field(default_factory=list, description="List of mandi market records")


class CommodityItem(BaseModel):
    name: str = Field(..., description="Commodity display name")
    category: Optional[str] = Field(None, description="Agricultural category (Vegetables, Fruits, Grains, etc.)")


class CommodityListResponse(BaseModel):
    commodities: List[str] = Field(..., description="List of available commodities in official market records")
    total: int = Field(..., description="Count of commodities")


class LocationHierarchyResponse(BaseModel):
    states: List[str] = Field(..., description="List of available states")
    districts_by_state: Dict[str, List[str]] = Field(default_factory=dict, description="State → districts mapping")
    markets_by_district: Dict[str, List[str]] = Field(default_factory=dict, description="District → mandis mapping")
