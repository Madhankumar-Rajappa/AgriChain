# 🌾 AgriChain — Full-Stack Agricultural Supply Chain Platform

AgriChain is a production-grade, modular, full-stack Agricultural Supply Chain Management Platform connecting **Farmers**, **Buyers**, **Transporters**, **Warehouse Managers**, and **System Administrators** into a seamless transparent marketplace and real-time logistics pipeline.

---

## 🏗️ Tech Stack & Clean Architecture

- **Backend**: Python 3.12+ / FastAPI / Pydantic v2 / SQLAlchemy 2.0 / Alembic DB Migrations / PyMySQL / JWT Authentication / Bcrypt Security.
- **Database**: MySQL Server (Database: `agrichain_db` on Port 3306).
- **Frontend**: React 18 / Vite 5 / Tailwind CSS / React Router v6 / Axios Client / Lucide React Icons / Recharts Data Visualization.
- **Automated Verification**: Pytest Suite (`41/41 passed 100%`) / Vite Production Build.

---

## ⚡ Quick Start — 1-Click Launch (Windows)

Simply double-click **`start_agrichain.bat`** in the project root directory, or run it from your terminal:

```cmd
start_agrichain.bat
```

This automated launcher will:
1. Run Alembic database migrations (`alembic upgrade head`).
2. Seed MySQL with demo users, crop listings, and warehouse facilities (`python seed.py`).
3. Launch the FastAPI Backend server on `http://localhost:8000`.
4. Launch the React Frontend server on `http://localhost:5173`.
5. Open your default web browser to `http://localhost:5173`.

---

## 💻 Manual Setup & Execution Instructions

### 1. Backend Setup (FastAPI + MySQL)

```powershell
# Navigate to the backend directory
cd M:\Agrichain\backend

# Activate Virtual Environment
.\.venv\Scripts\Activate.ps1

# Run Database Migrations
alembic upgrade head

# Seed Database with Demo Accounts & Sample Crops
python seed.py

# Start Backend Server
python -m uvicorn app.main:app --reload --port 8000
```
- **Backend Base URL**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite)

```powershell
# Navigate to the frontend directory
cd M:\Agrichain\frontend

# Start Development Server
cmd /c "npm run dev"
```
- **Frontend Web App URL**: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login Enabled)

| Role | User Name | Email Address | Password | Key Role Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| 🌾 **Farmer** | Ramesh Patel | `farmer@agrichain.com` | `Farmer123!` | List crop yields, set price, manage sales & orders |
| 🛒 **Buyer** | Anita Sharma | `buyer@agrichain.com` | `Buyer123!` | Browse crops, filter, place orders & pay online |
| 🚚 **Transporter** | Express Agri | `transporter@agrichain.com` | `Transporter123!` | Assign drivers/vehicles & update live transit status |
| 🏭 **Warehouse Manager** | Kisan Storage | `warehouse@agrichain.com` | `Warehouse123!` | Manage cold storage capacity & release harvest |
| 📊 **Admin** | System Admin | `admin@agrichain.com` | `Admin123!` | Monitor platform metrics, revenue & volume |

---

## 🧪 Automated Testing & Verification

Run the full Pytest test suite across all 9 system modules:

```powershell
cd M:\Agrichain\backend
.\.venv\Scripts\python.exe -m pytest
```

Output:
```text
======================= 41 passed in 30.63s =======================
```

To test frontend production build compilation:

```powershell
cd M:\Agrichain\frontend
cmd /c "npm run build"
```

Output:
```text
✓ 1575 modules transformed.
✓ built in 2.31s
```

---

## 📋 End-to-End User Flow Walkthrough

1. **Farmer**: Logs in → Navigates to `/farmer/market-prices` → Searches Commodity (e.g. Tomato), selects State (e.g. Tamil Nadu), District (Coimbatore) → Inspects latest official mandi modal price with real crop photo fetched from Pexels → Navigates to `/farmer/crops/add` → Registers competitive crop yield listing.
2. **Buyer**: Logs in → Navigates to `/marketplace` → Searches & filters wheat → Places order for 500 kg → Navigates to `/orders/:orderId/pay` → Completes payment.
3. **Warehouse Manager**: Logs in → Navigates to `/warehouse/facilities` → Accepts crop storage booking into Cold Storage Hub.
4. **Transporter**: Logs in → Navigates to `/transporter/shipments` → Assigns driver & vehicle → Updates status to `IN_TRANSIT` then `DELIVERED`.
5. **Admin**: Logs in → Navigates to `/admin/analytics` → Observes total order volume, transaction metrics, and active role breakdowns.

---

## 🌾 Market Price Module — Latest Mandi Prices + Real Crop Photos

### Purpose
The **Market Price Module** delivers transparent, official agricultural market intelligence directly to farmers and agribusiness stakeholders. It empowers farmers to inspect official benchmark mandi wholesale rates and automatically fetches a real photograph of each selected commodity before negotiating or pricing their harvest on the AgriChain marketplace.

> ⚠️ **IMPORTANT — Data Terminology**
> The application displays **"Latest Available Mandi Price"** — not "live second-by-second price".
> The Government of India OGD/AGMARKNET data is reported daily by regulated mandis.
> All prices include the **data date** prominently to avoid any misleading impression.

### Search Flow

```
Farmer opens Market Prices
        ↓
Selects Commodity (e.g., Tomato)
        ↓
Selects State (e.g., Tamil Nadu)
        ↓
Selects District (e.g., Coimbatore)
        ↓
React calls FastAPI → GET /api/v1/market/prices?commodity=Tomato&state=Tamil Nadu&district=Coimbatore
        ↓
FastAPI → data.gov.in OGD API (live attempt)
        ↓ (if OGD unavailable → AGMARKNET benchmark snapshot)
Backend normalizes prices (₹/quintal + ₹/kg calculation)
        ↓
Backend resolves ONE crop image from Pexels (server-side, key never exposed)
        ↓
Backend returns: actual prices + market + date + source + real crop image + attribution
        ↓
React displays market cards with Pexels photo attribution
```

### Key Capabilities

| Capability | Detail |
| :--- | :--- |
| **Generic Market API** | `GET /api/v1/market/prices` — supports `commodity`, `state`, `district`, `market`, `date` filters |
| **Official Data Source** | Government of India OGD / Directorate of Marketing & Inspection (AGMARKNET) |
| **Live API** | data.gov.in Resource ID `9ef84268-d588-465a-a308-a864a43d0070` |
| **Fallback** | Curated AGMARKNET benchmark snapshot (when OGD API is temporarily unavailable) |
| **Crop Images** | Pexels API (primary) → Wikipedia PageImages (secondary) → Curated CDN (tertiary) |
| **Image Security** | Pexels API key is **server-side only** — never in `VITE_*` or any frontend variable |
| **Image Storage** | **None** — images fetched dynamically from external providers |
| **Photo Attribution** | Photographer name, photo link, provider displayed per card (Pexels terms compliance) |
| **One Image Per Commodity** | Single Pexels call per commodity, reused across all market cards (avoids N×API calls) |
| **Price Normalization** | `price_per_kg = modal_price / 100` (1 quintal = 100 kg) |
| **Display** | Both ₹/quintal AND ≈ ₹/kg shown per card |
| **Data Transparency** | Data date prominently shown; source explicitly labeled |
| **TTL Caching** | Market data: 15-minute in-memory cache. Image URLs: 1-hour in-memory cache |
| **Resilience** | OGD outage → snapshot. Pexels outage → Wikipedia → CDN fallback. No crash. |
| **Responsive Layout** | 3 cards/row (desktop), 2 cards/row (tablet), 1 card/row (mobile) |

### API Endpoints

| HTTP Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/market/prices` | `commodity`, `state`, `district`, `market`, `date` | Latest available mandi prices + crop image |
| `GET` | `/api/v1/market/commodities` | — | List of tracked agricultural commodities |
| `GET` | `/api/v1/market/locations` | — | State → district → mandi hierarchy for dropdowns |

#### Example Request
```http
GET /api/v1/market/prices?commodity=Tomato&state=Tamil%20Nadu&district=Coimbatore
```

#### Example Normalized Response
```json
{
  "commodity": "Tomato",
  "image": {
    "image_url": "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg",
    "photo_url": "https://www.pexels.com/photo/tomato-1327838/",
    "photographer": "Jane Doe",
    "photographer_url": "https://www.pexels.com/@janedoe",
    "provider": "Pexels"
  },
  "state": "Tamil Nadu",
  "district": "Coimbatore",
  "market": null,
  "date": "2026-09-28",
  "source": "Government of India / Directorate of Marketing and Inspection (OGD)",
  "last_updated": "2026-09-28T18:05:12.000000+00:00",
  "total_markets": 3,
  "markets": [
    {
      "market": "Coimbatore (Anna Market)",
      "state": "Tamil Nadu",
      "district": "Coimbatore",
      "commodity": "Tomato",
      "variety": "Local / Hybrid",
      "arrival_date": "2026-09-28",
      "min_price": 2400.0,
      "max_price": 3200.0,
      "modal_price": 2800.0,
      "unit": "quintal",
      "price_per_kg": 28.0,
      "image_url": "https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg",
      "photo_url": "https://www.pexels.com/photo/tomato-1327838/",
      "photographer": "Jane Doe",
      "photographer_url": "https://www.pexels.com/@janedoe",
      "image_provider": "Pexels"
    }
  ]
}
```

### Government Data Source

| Detail | Value |
| :--- | :--- |
| **Platform** | Government of India Open Government Data (OGD) Platform |
| **Department** | Department of Agriculture & Farmers Welfare |
| **Directorate** | Directorate of Marketing and Inspection (DMI) |
| **Dataset** | Current Daily Price of Various Commodities from Various Markets (Mandi) |
| **Resource ID** | `9ef84268-d588-465a-a308-a864a43d0070` |
| **API Endpoint** | `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` |
| **Update Frequency** | Daily (submitted by regulated wholesale mandis across India) |
| **API Key** | Free registration at https://data.gov.in/user/register |

### Image Provider

| Detail | Value |
| :--- | :--- |
| **Primary** | [Pexels API](https://www.pexels.com/api/) — `Authorization: <CROP_IMAGE_API_KEY>` header |
| **Secondary** | [Wikipedia PageImages API](https://www.mediawiki.org/wiki/Extension:PageImages) — open access |
| **Tertiary** | Curated Unsplash CDN URLs — stable public URLs, no key required |
| **Attribution** | Pexels: photographer name + photo link displayed per card |
| **Storage** | **None** — images served directly from provider CDN, never downloaded |

### Environment Configuration

Add to `backend/.env`:

```env
# Official Agricultural Market Prices Data API (data.gov.in / OGD / AGMARKNET)
# Free key: https://data.gov.in/user/register
# Leave empty to use AGMARKNET benchmark snapshot
MARKET_DATA_API_KEY=""
DATA_GOV_RESOURCE_ID="9ef84268-d588-465a-a308-a864a43d0070"

# Crop Photograph API Key — Pexels (SERVER-SIDE ONLY — never use VITE_* prefix)
# Free key: https://www.pexels.com/api/
# Leave empty to use Wikipedia PageImages + CDN fallback chain
CROP_IMAGE_API_KEY=""
```

> ⚠️ **Security**: `CROP_IMAGE_API_KEY` must **never** be placed in `VITE_*` environment
> variables or any frontend-accessible location. The backend proxies all Pexels requests.

### How to Obtain API Keys

#### data.gov.in (Market Data)
1. Register at https://data.gov.in/user/register
2. Log in → My Account → Manage API Keys → Create New Key
3. Copy the key and set `MARKET_DATA_API_KEY` in `backend/.env`

#### Pexels (Crop Images)
1. Create a free account at https://www.pexels.com/api/
2. Visit https://www.pexels.com/api/new/ → fill out the application form
3. Copy the API key and set `CROP_IMAGE_API_KEY` in `backend/.env`

### How to Test the Market Prices Feature

#### 1. Swagger API Test
Navigate to `http://localhost:8000/docs` → expand **Agricultural Market Prices (Mandi)** section.

Test `GET /api/v1/market/prices`:
- `commodity`: `Tomato`
- `state`: `Tamil Nadu`
- `district`: `Coimbatore`

Verify:
- ✅ `markets` array contains real market records
- ✅ `arrival_date` shows today's date
- ✅ `image.image_url` is a working URL
- ✅ `image.photographer` is set (if Pexels key configured)
- ✅ `image.provider` shows `"Pexels"`, `"Wikipedia"`, or `"CDN"`
- ✅ `price_per_kg` = `modal_price / 100`

#### 2. Frontend Integration Test
1. Log in as Farmer: `farmer@agrichain.com` / `Farmer123!`
2. Navigate to **Market Prices** (sidebar)
3. Select **Tomato** → **Tamil Nadu** → **Coimbatore**
4. Verify:
   - Real crop photograph loads (Pexels/Wikipedia)
   - Photographer attribution displayed
   - Min / Modal / Max prices shown
   - ₹/kg conversion correct
   - Data date visible
   - Source attribution: "Govt. of India OGD"
5. Repeat with: Onion, Banana, Mango, Wheat, Cotton
6. Test location filtering: Karnataka → Bengaluru Urban
7. Test empty state: enter a commodity not in the dataset
8. Disable Pexels key → confirm prices still appear, image shows Wikipedia/CDN fallback

### Data Update Frequency & Disclaimer

Official government mandi data is submitted daily by regulated wholesale markets (APMCs/Mandis) to the AGMARKNET portal. The application:
- Attempts live OGD API data on every request (cache expires every 15 minutes)
- Falls back to curated AGMARKNET benchmark snapshot if the OGD API is temporarily unavailable
- Always prominently displays the **data date** (not implied as real-time)
- Labels data source explicitly as "Government of India / Directorate of Marketing and Inspection (OGD)"

### Image Attribution & Compliance

Per Pexels API Terms:
- Photographer name is displayed on every crop photo card
- A link to the original photo page on Pexels is provided
- "Photo by [Photographer] on Pexels" format is used
- Attribution is shown both as an overlay on the photo and in the card footer

### Known Limitations

1. **OGD API Rate / Availability**: The data.gov.in API can be intermittently unavailable (HTTP 503). The AGMARKNET snapshot fallback ensures the feature continues working.
2. **Snapshot Data**: The benchmark snapshot contains representative prices from major Indian mandis. It is not a live feed — it is used only when the OGD API is unreachable.
3. **Pexels Rate Limits**: Free tier — 200 requests/hour, 20,000/month. With 1-hour in-memory caching per commodity, practical usage is well within limits.
4. **Image Relevance**: Pexels search returns the best matching photo for the search query but cannot guarantee 100% agricultural context for all commodities.
5. **No Price Prediction**: This feature shows **actual current market data only**. Price prediction is a separate future feature.
6. **Regional Coverage**: The snapshot covers major mandis in Tamil Nadu, Karnataka, Maharashtra, Andhra Pradesh, Telangana, Uttar Pradesh, Punjab, Madhya Pradesh, Rajasthan, and Gujarat. Coverage expands with the live OGD API.

---

## 🚚 Live Shipment Tracking Map Feature

### Architecture & Conceptual Flow

```
Transporter Device (Browser Geolocation API)
           │
           │  watchPosition() (Real Device GPS)
           ▼
WebSocket /api/v1/tracking/ws/{shipment_id}?token={JWT}
           │
           ├── Authenticate JWT & Role Authority
           ├── Anti-Spoofing Check: current_user.id == shipment.transporter_id
           ├── Persist to DB (`shipment_locations` table via SQLAlchemy)
           │
           ▼
TrackingConnectionManager (In-Memory Room Isolated per shipment_id)
           │
           ├────────────────────────────┐
           ▼                            ▼
Farmer Live Map View             Buyer Live Map View
(React Leaflet + OSM)            (React Leaflet + OSM)
           │                            │
           ▼                            ▼
Real-Time Transporter Marker Moves with GPS Coordinates
```

### Key Capabilities
- **Real Device GPS Only**: Transporter device requests location permissions via `navigator.geolocation.watchPosition` with `enableHighAccuracy: true`. **Zero fake moving trucks or random math simulation in production.**
- **Bi-directional WebSocket with Resilient Reconnect**: Live low-latency updates with exponential backoff retry and ping-pong keepalives.
- **Privacy & Role-Based Access Control**:
  - Only assigned transporter can broadcast coordinates.
  - Only participants associated with the shipment (Transporter, Farmer, Buyer, Admin) can subscribe to or view tracking.
  - Live tracking is strictly tied to active shipments (`IN_TRANSIT`). Delivers auto-terminate tracking.
- **Interactive OpenStreetMap Map**: React Leaflet with smooth pan, heading indicator, vehicle rotation, speed/accuracy telemetry, and historical breadcrumb path polyline.

### API Endpoints
- `POST /api/v1/tracking/{shipment_id}/start`: Transporter activates live GPS broadcast session and transitions status to `IN_TRANSIT`.
- `POST /api/v1/tracking/{shipment_id}/stop`: Transporter halts tracking session.
- `POST /api/v1/tracking/{shipment_id}/location`: REST fallback endpoint to submit validated GPS coordinate points.
- `GET /api/v1/tracking/{shipment_id}/latest`: Retrieves the most recently recorded coordinate for this shipment.
- `GET /api/v1/tracking/{shipment_id}/history`: Returns historical GPS coordinates in chronological order to render routes.
- `WS /api/v1/tracking/ws/{shipment_id}?token={JWT}`: Authenticated WebSocket room for live streaming.

### Database Changes
- **Table**: `shipment_locations`
- **Fields**: `id`, `shipment_id` (FK shipments.id), `transporter_id` (FK users.id), `latitude`, `longitude`, `accuracy`, `speed`, `heading`, `altitude`, `recorded_at`
- **Indexes**: `ix_shipment_locations_shipment_id`, `ix_shipment_locations_transporter_id`, `ix_shipment_locations_recorded_at`, and composite `ix_shipment_locations_shipment_recorded`.
- **Alembic Migration**: `007_shipment_locations.py` applied at head.

---
