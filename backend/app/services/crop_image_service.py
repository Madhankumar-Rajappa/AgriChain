"""
Crop Image Service — AgriChain Agricultural Produce Image Resolver

Fetches real, high-quality photographs of agricultural commodities dynamically.
Uses the following resolution chain:

  1. Pexels API (primary)  — searched server-side; API key kept backend-only
  2. Wikipedia / Wikimedia PageImages API (secondary, open-access)
  3. Curated Unsplash CDN fallback (tertiary, known-good stable URLs)

IMPORTANT:
  - No images are ever stored locally or in the database.
  - The CROP_IMAGE_API_KEY (Pexels key) is NEVER exposed to the React frontend.
  - One image is resolved per commodity name, then cached for 1 hour.
  - Image resolution failures are handled gracefully; market prices remain unaffected.
"""
import time
from typing import Optional, Dict, Any
import httpx

from app.core.config import settings
from app.core.logging import logger


# ---------------------------------------------------------------------------
# In-memory image cache with TTL (1 hour)
# Structure: { normalized_commodity: (image_info_dict, expiration_epoch) }
# ---------------------------------------------------------------------------
_IMAGE_CACHE: Dict[str, tuple[Optional[Dict[str, Any]], float]] = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour


# ---------------------------------------------------------------------------
# Crop-specific search refinements for each provider
# ---------------------------------------------------------------------------
CROP_SEARCH_REFINEMENTS: Dict[str, Dict[str, str]] = {
    "tomato": {
        "pexels_query": "fresh tomato vegetable",
        "wiki": "Tomato",
        "fallback": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
    },
    "onion": {
        "pexels_query": "fresh onion vegetable",
        "wiki": "Onion",
        "fallback": "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80"
    },
    "potato": {
        "pexels_query": "fresh potato vegetable",
        "wiki": "Potato",
        "fallback": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
    },
    "brinjal": {
        "pexels_query": "fresh brinjal eggplant vegetable",
        "wiki": "Eggplant",
        "fallback": "https://images.unsplash.com/photo-1628773822503-930a8449c2a6?auto=format&fit=crop&w=800&q=80"
    },
    "eggplant": {
        "pexels_query": "fresh eggplant vegetable",
        "wiki": "Eggplant",
        "fallback": "https://images.unsplash.com/photo-1628773822503-930a8449c2a6?auto=format&fit=crop&w=800&q=80"
    },
    "banana": {
        "pexels_query": "fresh banana fruit",
        "wiki": "Banana",
        "fallback": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
    },
    "cabbage": {
        "pexels_query": "fresh cabbage vegetable",
        "wiki": "Cabbage",
        "fallback": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80"
    },
    "cauliflower": {
        "pexels_query": "fresh cauliflower vegetable",
        "wiki": "Cauliflower",
        "fallback": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80"
    },
    "carrot": {
        "pexels_query": "fresh carrot vegetable",
        "wiki": "Carrot",
        "fallback": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"
    },
    "green chilli": {
        "pexels_query": "fresh green chili pepper",
        "wiki": "Chili pepper",
        "fallback": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"
    },
    "chilli": {
        "pexels_query": "fresh hot chili pepper",
        "wiki": "Chili pepper",
        "fallback": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80"
    },
    "garlic": {
        "pexels_query": "fresh garlic bulb",
        "wiki": "Garlic",
        "fallback": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80"
    },
    "ginger": {
        "pexels_query": "fresh ginger root",
        "wiki": "Ginger",
        "fallback": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    },
    "coconut": {
        "pexels_query": "fresh coconut fruit",
        "wiki": "Coconut",
        "fallback": "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?auto=format&fit=crop&w=800&q=80"
    },
    "mango": {
        "pexels_query": "fresh mango fruit",
        "wiki": "Mango",
        "fallback": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"
    },
    "watermelon": {
        "pexels_query": "fresh watermelon fruit",
        "wiki": "Watermelon",
        "fallback": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
    },
    "cotton": {
        "pexels_query": "cotton plant crop harvest",
        "wiki": "Cotton",
        "fallback": "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?auto=format&fit=crop&w=800&q=80"
    },
    "paddy": {
        "pexels_query": "paddy rice field harvest",
        "wiki": "Rice",
        "fallback": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    },
    "rice": {
        "pexels_query": "rice grain harvest",
        "wiki": "Rice",
        "fallback": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
    },
    "wheat": {
        "pexels_query": "wheat grain field harvest",
        "wiki": "Wheat",
        "fallback": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    },
    "maize": {
        "pexels_query": "fresh corn maize vegetable",
        "wiki": "Maize",
        "fallback": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80"
    },
    "corn": {
        "pexels_query": "fresh corn cob vegetable",
        "wiki": "Maize",
        "fallback": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80"
    },
    "groundnut": {
        "pexels_query": "fresh peanut groundnut",
        "wiki": "Peanut",
        "fallback": "https://images.unsplash.com/photo-1567892328221-1a89c9e8dc9b?auto=format&fit=crop&w=800&q=80"
    },
    "peanut": {
        "pexels_query": "raw peanut groundnut",
        "wiki": "Peanut",
        "fallback": "https://images.unsplash.com/photo-1567892328221-1a89c9e8dc9b?auto=format&fit=crop&w=800&q=80"
    },
    "turmeric": {
        "pexels_query": "fresh turmeric root spice",
        "wiki": "Turmeric",
        "fallback": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
    },
    "tapioca / cassava": {
        "pexels_query": "fresh cassava tapioca vegetable",
        "wiki": "Cassava",
        "fallback": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"
    },
    "tapioca": {
        "pexels_query": "fresh cassava tapioca vegetable",
        "wiki": "Cassava",
        "fallback": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"
    },
    "cassava": {
        "pexels_query": "fresh cassava root vegetable",
        "wiki": "Cassava",
        "fallback": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"
    },
    "lady finger": {
        "pexels_query": "fresh okra vegetable",
        "wiki": "Okra",
        "fallback": "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=800&q=80"
    },
    "bhindi": {
        "pexels_query": "fresh okra vegetable",
        "wiki": "Okra",
        "fallback": "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=800&q=80"
    },
    "drumstick": {
        "pexels_query": "fresh moringa drumstick pods vegetable",
        "wiki": "Moringa oleifera",
        "fallback": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
    },
    "apple": {
        "pexels_query": "fresh apple fruit",
        "wiki": "Apple",
        "fallback": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"
    },
    "capsicum": {
        "pexels_query": "fresh bell pepper capsicum vegetable",
        "wiki": "Bell pepper",
        "fallback": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80"
    },
    "cucumber": {
        "pexels_query": "fresh cucumber vegetable",
        "wiki": "Cucumber",
        "fallback": "https://images.unsplash.com/photo-1449339854873-750e6913301b?auto=format&fit=crop&w=800&q=80"
    },
    "papaya": {
        "pexels_query": "fresh papaya fruit",
        "wiki": "Papaya",
        "fallback": "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80"
    },
    "orange": {
        "pexels_query": "fresh orange fruit",
        "wiki": "Orange (fruit)",
        "fallback": "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80"
    },
    "pomegranate": {
        "pexels_query": "fresh pomegranate fruit",
        "wiki": "Pomegranate",
        "fallback": "https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&w=800&q=80"
    },
    "lemon": {
        "pexels_query": "fresh lemon citrus fruit",
        "wiki": "Lemon",
        "fallback": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=800&q=80"
    },
    "guava": {
        "pexels_query": "fresh guava fruit",
        "wiki": "Guava",
        "fallback": "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&w=800&q=80"
    },
}


class CropImageService:
    """
    Production image resolver for agricultural produce photographs.

    Priority chain:
      1. Pexels API     — requires CROP_IMAGE_API_KEY in backend .env
      2. Wikipedia API  — open access, no key needed
      3. Curated CDN    — stable Unsplash CDN URLs mapped per commodity

    Images are NEVER stored locally or in the database.
    The Pexels API key is NEVER forwarded to the React frontend.
    """

    @classmethod
    def normalize_crop_name(cls, commodity_name: str) -> str:
        """Normalize commodity string: strip, lowercase."""
        return (commodity_name or "").strip().lower()

    @classmethod
    def get_crop_image(cls, commodity_name: str) -> Optional[Dict[str, Any]]:
        """
        Returns a dict with image information for the given commodity:
          {
            "image_url":        str | None,   # direct image src URL
            "photo_url":        str | None,   # link to original photo page
            "photographer":     str | None,   # photographer name
            "photographer_url": str | None,   # photographer profile URL
            "provider":         str,          # "Pexels" | "Wikipedia" | "CDN"
          }
        Returns None only if every resolution method fails.
        """
        if not commodity_name:
            return None

        normalized = cls.normalize_crop_name(commodity_name)
        now = time.time()

        # --- Cache hit ---
        if normalized in _IMAGE_CACHE:
            cached_info, expiry = _IMAGE_CACHE[normalized]
            if now < expiry:
                return cached_info

        resolved: Optional[Dict[str, Any]] = None

        # Step 1: Pexels API (primary — requires CROP_IMAGE_API_KEY)
        pexels_key = getattr(settings, "CROP_IMAGE_API_KEY", None) or ""
        if pexels_key.strip():
            resolved = cls._fetch_from_pexels(normalized, commodity_name, pexels_key)

        # Step 2: Wikipedia PageImages API (secondary, open access)
        if not resolved:
            resolved = cls._fetch_from_wikipedia(normalized, commodity_name)

        # Step 3: Curated Unsplash CDN fallback (tertiary)
        if not resolved:
            refinement = CROP_SEARCH_REFINEMENTS.get(normalized, {})
            fallback_url = refinement.get("fallback")
            if fallback_url:
                resolved = {
                    "image_url": fallback_url,
                    "photo_url": fallback_url,
                    "photographer": None,
                    "photographer_url": None,
                    "provider": "CDN"
                }

        # Cache (even None to avoid repeated failing calls)
        _IMAGE_CACHE[normalized] = (resolved, now + _CACHE_TTL_SECONDS)
        return resolved

    @classmethod
    def get_crop_image_url(cls, commodity_name: str) -> Optional[str]:
        """
        Convenience method — returns just the image_url string (or None).
        Used for backward-compat where only URL is needed.
        """
        info = cls.get_crop_image(commodity_name)
        if info:
            return info.get("image_url")
        return None

    # -----------------------------------------------------------------------
    # Private: Pexels API
    # -----------------------------------------------------------------------
    @classmethod
    def _fetch_from_pexels(
        cls,
        normalized: str,
        original_name: str,
        api_key: str
    ) -> Optional[Dict[str, Any]]:
        """
        Queries https://api.pexels.com/v1/search with the commodity name.
        Authorization: <API_KEY> (server-side only, never sent to client).
        Returns rich dict with image_url, photo_url, photographer, provider.
        """
        refinement = CROP_SEARCH_REFINEMENTS.get(normalized, {})
        query = refinement.get("pexels_query") or f"fresh {original_name} vegetable fruit agricultural"

        try:
            url = "https://api.pexels.com/v1/search"
            params = {
                "query": query,
                "per_page": 1,
                "orientation": "landscape",
                "size": "medium"
            }
            headers = {
                "Authorization": api_key
            }
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    photos = data.get("photos", [])
                    if photos:
                        photo = photos[0]
                        src = photo.get("src", {})
                        image_url = (
                            src.get("large2x")
                            or src.get("large")
                            or src.get("medium")
                            or src.get("original")
                        )
                        if image_url:
                            return {
                                "image_url": image_url,
                                "photo_url": photo.get("url"),
                                "photographer": photo.get("photographer"),
                                "photographer_url": photo.get("photographer_url"),
                                "provider": "Pexels"
                            }
                elif resp.status_code == 401:
                    logger.warning(
                        "Pexels API: Invalid or missing API key. "
                        "Set CROP_IMAGE_API_KEY in backend .env to enable Pexels integration."
                    )
                else:
                    logger.warning(f"Pexels API responded with HTTP {resp.status_code} for '{original_name}'")
        except Exception as e:
            logger.warning(f"Pexels API lookup failed for '{original_name}': {e}")

        return None

    # -----------------------------------------------------------------------
    # Private: Wikipedia / Wikimedia PageImages API
    # -----------------------------------------------------------------------
    @classmethod
    def _fetch_from_wikipedia(
        cls,
        normalized: str,
        original_name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Queries the Wikipedia PageImages API (open access, no key needed).
        Returns image_url and attributes source as 'Wikipedia'.
        """
        refinement = CROP_SEARCH_REFINEMENTS.get(normalized, {})
        wiki_title = refinement.get("wiki") or original_name.title()

        try:
            url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "titles": wiki_title,
                "prop": "pageimages",
                "format": "json",
                "pithumbsize": 800
            }
            headers = {
                "User-Agent": "AgriChain-MarketService/1.0 (agrichain-dev@agrimitra.ai)"
            }
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    pages = data.get("query", {}).get("pages", {})
                    for _, page_data in pages.items():
                        thumbnail = page_data.get("thumbnail", {})
                        source = thumbnail.get("source")
                        if source:
                            # Construct Wikimedia Commons page link if possible
                            page_title = page_data.get("title", wiki_title)
                            commons_url = f"https://en.wikipedia.org/wiki/{page_title.replace(' ', '_')}"
                            return {
                                "image_url": source,
                                "photo_url": commons_url,
                                "photographer": "Wikipedia / Wikimedia Commons",
                                "photographer_url": "https://commons.wikimedia.org",
                                "provider": "Wikipedia"
                            }
        except Exception as e:
            logger.warning(f"Wikipedia PageImages lookup failed for '{original_name}': {e}")

        return None
