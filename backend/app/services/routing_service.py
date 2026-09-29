"""
Routing Service — Calculates real road routes between two geographic points.

Uses OSRM (Open Source Routing Machine) for road-based route calculation.
- Free, no API key required for the demo server.
- Returns route geometry (GeoJSON coordinates), distance, and duration.
- For production, self-host OSRM or use a commercial routing provider.
"""

import logging
from typing import Optional, List, Tuple, Dict, Any
import httpx

from app.core.config import settings

logger = logging.getLogger("agrichain.routing")


async def get_road_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float
) -> Optional[Dict[str, Any]]:
    """
    Get a real road route between origin and destination using OSRM.

    OSRM expects coordinates as longitude,latitude (note the order).

    Returns:
        Dictionary with:
            - distance: total distance in meters
            - duration: estimated duration in seconds
            - geometry: list of [latitude, longitude] coordinate pairs (Leaflet-friendly order)
        Or None if routing fails.
    """
    osrm_base = settings.OSRM_API_URL.rstrip("/")

    # OSRM coordinate format: lng,lat;lng,lat
    coords = f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
    url = f"{osrm_base}/route/v1/driving/{coords}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)

            if response.status_code != 200:
                logger.warning(f"[Routing] OSRM returned status {response.status_code}")
                return None

            data = response.json()

            if data.get("code") != "Ok" or not data.get("routes"):
                logger.warning(f"[Routing] OSRM returned no valid routes: {data.get('code')}")
                return None

            route = data["routes"][0]
            leg = route["legs"][0]

            # Extract GeoJSON coordinates and convert to Leaflet [lat, lng] order
            geojson_coords = route["geometry"]["coordinates"]
            # GeoJSON is [lng, lat], Leaflet uses [lat, lng]
            leaflet_coords = [[coord[1], coord[0]] for coord in geojson_coords]

            result = {
                "distance": round(leg["distance"]),         # meters
                "duration": round(leg["duration"]),          # seconds
                "distance_km": round(leg["distance"] / 1000, 1),
                "duration_minutes": round(leg["duration"] / 60, 1),
                "geometry": leaflet_coords
            }

            logger.info(
                f"[Routing] Route calculated: {result['distance_km']} km, "
                f"{result['duration_minutes']} min, {len(leaflet_coords)} waypoints"
            )
            return result

    except httpx.TimeoutException:
        logger.error("[Routing] OSRM request timed out")
        return None
    except Exception as e:
        logger.error(f"[Routing] Error calculating route: {e}")
        return None


def calculate_distance_along_route(
    route_geometry: List[List[float]],
    current_lat: float,
    current_lng: float
) -> Optional[Dict[str, float]]:
    """
    Calculate distance travelled and remaining along a route based on current GPS position.

    Uses haversine distance to find the nearest point on the route,
    then sums segment distances for travelled/remaining.

    Args:
        route_geometry: List of [lat, lng] coordinate pairs
        current_lat: Transporter's current latitude
        current_lng: Transporter's current longitude

    Returns:
        Dictionary with:
            - distance_travelled_km: distance from start to nearest route point
            - distance_remaining_km: distance from nearest route point to destination
            - nearest_point_index: index of nearest point on route
        Or None if calculation fails.
    """
    import math

    if not route_geometry or len(route_geometry) < 2:
        return None

    def haversine(lat1, lon1, lat2, lon2):
        """Calculate great-circle distance between two points in km."""
        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    # Find nearest point on route
    min_dist = float('inf')
    nearest_idx = 0
    for i, point in enumerate(route_geometry):
        d = haversine(current_lat, current_lng, point[0], point[1])
        if d < min_dist:
            min_dist = d
            nearest_idx = i

    # Calculate cumulative distances along the route
    travelled = 0.0
    for i in range(1, nearest_idx + 1):
        travelled += haversine(
            route_geometry[i - 1][0], route_geometry[i - 1][1],
            route_geometry[i][0], route_geometry[i][1]
        )

    remaining = 0.0
    for i in range(nearest_idx + 1, len(route_geometry)):
        remaining += haversine(
            route_geometry[i - 1][0], route_geometry[i - 1][1],
            route_geometry[i][0], route_geometry[i][1]
        )

    return {
        "distance_travelled_km": round(travelled, 1),
        "distance_remaining_km": round(remaining, 1),
        "nearest_point_index": nearest_idx
    }
