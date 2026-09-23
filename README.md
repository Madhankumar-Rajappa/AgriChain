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

1. **Farmer**: Logs in -> Navigates to `/farmer/crops/add` -> Registers crop yield (e.g. *Sharbati Wheat*, 5000 kg @ ₹42.50/kg).
2. **Buyer**: Logs in -> Navigates to `/marketplace` -> Searches & filters wheat -> Places order for 500 kg -> Navigates to `/orders/:orderId/pay` -> Completes payment.
3. **Warehouse Manager**: Logs in -> Navigates to `/warehouse/facilities` -> Accepts crop storage booking into Cold Storage Hub.
4. **Transporter**: Logs in -> Navigates to `/transporter/shipments` -> Assigns driver & vehicle -> Updates status to `IN_TRANSIT` then `DELIVERED`.
5. **Admin**: Logs in -> Navigates to `/admin/analytics` -> Observes total order volume, transaction metrics, and active role breakdowns.
