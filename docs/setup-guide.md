# AgriChain Local Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- MySQL Server 8+ running locally or in Docker

## Step 1: Database Setup

Create the MySQL database:
```sql
CREATE DATABASE IF NOT EXISTS agrichain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Backend Configuration

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate # Linux/macOS
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   ```env
   PROJECT_NAME="AgriChain API"
   ENVIRONMENT="development"
   DATABASE_URL="mysql+pymysql://root:root@localhost:3306/agrichain_db"
   SECRET_KEY="agrichain_super_secret_development_key"
   CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
   ```
5. Run migrations & start server:
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

## Step 3: Frontend Configuration

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.
