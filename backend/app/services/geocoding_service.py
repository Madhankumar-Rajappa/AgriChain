"""
Geocoding Service — Converts text addresses to latitude/longitude coordinates.

Uses OpenStreetMap Nominatim for geocoding.
- Free, no API key required.
- Requires a valid User-Agent header per usage policy.
- Rate-limited to 1 request/second.
- Results are cached in-memory to avoid redundant lookups.
"""

import time
import logging
from typing import Optional, Tuple, Dict
import httpx

from app.core.config import settings

logger = logging.getLogger("agrichain.geocoding")

# In-memory cache: address string → (latitude, longitude)
_geocode_cache: Dict[str, Tuple[float, float]] = {}

# Timestamp of last request (for rate limiting)
_last_request_time: float = 0.0


def _normalize_address(address: str) -> str:
    """Normalize address string for consistent cache keys."""
    return address.strip().lower()


async def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode a text address into (latitude, longitude) using Nominatim.

    Returns:
        Tuple of (latitude, longitude) or None if geocoding fails.
    """
    global _last_request_time

    if not address or not address.strip():
        return None

    cache_key = _normalize_address(address)

    # Check cache first
    if cache_key in _geocode_cache:
        logger.debug(f"[Geocoding] Cache hit for: {address}")
        return _geocode_cache[cache_key]

    # Rate limiting: wait if needed to respect 1 req/sec
    now = time.time()
    elapsed = now - _last_request_time
    if elapsed < 1.1:
        wait_time = 1.1 - elapsed
        logger.debug(f"[Geocoding] Rate limiting — waiting {wait_time:.2f}s")
        time.sleep(wait_time)

    nominatim_url = settings.NOMINATIM_API_URL
    params = {
        "q": address,
        "format": "json",
        "limit": 1,
        "addressdetails": 0
    }
    headers = {
        "User-Agent": "AgriChain/1.0 (Agricultural Supply Chain Management System)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(nominatim_url, params=params, headers=headers)
            _last_request_time = time.time()

            if response.status_code != 200:
                logger.warning(f"[Geocoding] Nominatim returned status {response.status_code} for: {address}")
                return None

            data = response.json()
            if not data or len(data) == 0:
                logger.warning(f"[Geocoding] No results found for address: {address}")
                return None

            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])

            # Cache the result
            _geocode_cache[cache_key] = (lat, lon)
            logger.info(f"[Geocoding] Resolved '{address}' → ({lat}, {lon})")
            return (lat, lon)

    except httpx.TimeoutException:
        logger.error(f"[Geocoding] Timeout geocoding address: {address}")
        return None
    except Exception as e:
        logger.error(f"[Geocoding] Error geocoding address '{address}': {e}")
        return None


def geocode_address_sync(address: str) -> Optional[Tuple[float, float]]:
    """
    Synchronous version of geocode_address for use outside async contexts.
    """
    global _last_request_time

    if not address or not address.strip():
        return None

    cache_key = _normalize_address(address)

    if cache_key in _geocode_cache:
        logger.debug(f"[Geocoding] Cache hit for: {address}")
        return _geocode_cache[cache_key]

    now = time.time()
    elapsed = now - _last_request_time
    if elapsed < 1.1:
        wait_time = 1.1 - elapsed
        time.sleep(wait_time)

    nominatim_url = settings.NOMINATIM_API_URL
    params = {
        "q": address,
        "format": "json",
        "limit": 1,
        "addressdetails": 0
    }
    headers = {
        "User-Agent": "AgriChain/1.0 (Agricultural Supply Chain Management System)"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(nominatim_url, params=params, headers=headers)
            _last_request_time = time.time()

            if response.status_code != 200:
                logger.warning(f"[Geocoding] Nominatim returned status {response.status_code} for: {address}")
                return None

            data = response.json()
            if not data or len(data) == 0:
                logger.warning(f"[Geocoding] No results found for address: {address}")
                return None

            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])

            _geocode_cache[cache_key] = (lat, lon)
            logger.info(f"[Geocoding] Resolved '{address}' → ({lat}, {lon})")
            return (lat, lon)

    except httpx.TimeoutException:
        logger.error(f"[Geocoding] Timeout geocoding address: {address}")
        return None
    except Exception as e:
        logger.error(f"[Geocoding] Error geocoding address '{address}': {e}")
        return None
