from typing import Optional
from fastapi import APIRouter, Query, status

from app.schemas.market import (
    MarketPricesResponse,
    CommodityListResponse,
    LocationHierarchyResponse,
)
from app.services.market_price_service import MarketPriceService

router = APIRouter(prefix="/market", tags=["Agricultural Market Prices (Mandi)"])


@router.get(
    "/prices",
    response_model=MarketPricesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Available Agricultural Market Mandi Prices"
)
def get_market_prices(
    commodity: Optional[str] = Query(None, description="Agricultural commodity name (e.g., Tomato, Onion, Banana)"),
    state: Optional[str] = Query(None, description="State name filter (e.g., Tamil Nadu, Karnataka)"),
    district: Optional[str] = Query(None, description="District name filter (e.g., Coimbatore, Madurai)"),
    market: Optional[str] = Query(None, description="Specific mandi/market name"),
    date: Optional[str] = Query(None, description="Price reporting date filter (YYYY-MM-DD)")
):
    """
    Retrieves the latest available official agricultural mandi prices.
    Includes minimum price, maximum price, modal price, computed price per kilogram (modal / 100),
    and automatically resolved crop image URL.
    """
    return MarketPriceService.get_market_prices(
        commodity=commodity,
        state=state,
        district=district,
        market=market,
        date=date
    )


@router.get(
    "/commodities",
    response_model=CommodityListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Available Agricultural Commodities"
)
def get_available_commodities():
    """
    Returns the list of commodities currently tracked across official agricultural mandis.
    """
    return MarketPriceService.get_available_commodities()


@router.get(
    "/locations",
    response_model=LocationHierarchyResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Location Hierarchy (States, Districts, Mandis)"
)
def get_location_hierarchy():
    """
    Returns available state, district, and mandi market filters for seamless farmer dropdowns.
    """
    return MarketPriceService.get_location_hierarchy()
