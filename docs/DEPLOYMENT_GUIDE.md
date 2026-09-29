# 🚀 AgriChain Vercel Deployment Guide

This guide walks you through deploying the **AgriChain Frontend** to **Vercel** and linking it with the backend.

---

## 📋 Overview of Full-Stack Architecture

| Tier | Component | Recommended Hosting | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS | **Vercel** (Global Edge CDN) | Ultra-fast client-side SPA with Leaflet maps and WebSockets. |
| **Backend** | FastAPI + WebSockets (Python 3.12) | **Render / Railway / Fly.io / AWS EC2** | REST API, WebSocket streams, and background geocoding. |
| **Database** | MySQL Server 8.0+ | **Aiven / PlanetScale / AWS RDS / Railway** | Managed relational database storing users, crops, orders, and GPS telemetry. |

---

## 🛠️ Method 1: Deploy to Vercel via GitHub (Recommended)

### Step 1: Push your code to GitHub
```bash
git add .
git commit -m "Configure Vercel deployment with client-side routing rewrites"
git push origin main
```

### Step 2: Import Project into Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`AgriChain`).

### Step 3: Configure Project Settings on Vercel
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` (or leave as root `/` — root `vercel.json` will handle it automatically)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables
In the **Environment Variables** section on Vercel, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend-api.onrender.com` | URL of your deployed FastAPI backend (No trailing slash). |
| `VITE_MAP_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Free OpenStreetMap tile server. |

### Step 5: Click "Deploy"
Vercel will build and assign you a live production URL:
`https://agrichain-frontend.vercel.app`

---

## 💻 Method 2: Deploy to Vercel via CLI

If you prefer deploying directly from your terminal:

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to the frontend directory
cd frontend

# 3. Log in to Vercel
vercel login

# 4. Deploy to preview
vercel

# 5. Deploy to production
vercel --prod
```

During prompts:
- `Set up and deploy?` → **Y**
- `Which scope?` → Select your account/team
- `Link to existing project?` → **N**
- `Project name?` → **agrichain**
- `In which directory is your code located?` → **./** (if in frontend) or **frontend** (if at root)

---

## ⚙️ How Client-Side Routing is Handled
Vite SPAs use React Router for pages like `/admin/analytics`, `/tracking/:id`, and `/marketplace`. 
The included [`vercel.json`](file:///m:/AgriMitra%20AI/Agrichain/frontend/vercel.json) routes all traffic to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures refreshing pages on sub-paths will not return a 404 error.

---

## 🔗 Connecting with FastAPI Backend (CORS)
When deploying your FastAPI backend, make sure to add your Vercel domain to `CORS_ORIGINS` in your backend `.env`:

```env
CORS_ORIGINS=["http://localhost:5173", "https://your-agrichain-frontend.vercel.app"]
```
