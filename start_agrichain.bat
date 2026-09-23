@echo off
TITLE AgriChain Full Stack Launcher
COLOR 0A

echo =========================================================================
echo                   AGRICHAIN FULL STACK PLATFORM
echo =========================================================================
echo.
echo [1/3] Verifying and Seeding MySQL Database...
cd /d %~dp0backend
call .venv\Scripts\python.exe -m alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database migration failed. Ensure MySQL is running on port 3306.
    pause
    exit /b %ERRORLEVEL%
)

call .venv\Scripts\python.exe seed.py
echo.

echo [2/3] Launching FastAPI Backend Server (Port 8000)...
start "AgriChain Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [3/3] Launching React Frontend Server (Port 5173)...
start "AgriChain Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo  AgriChain is launching!
echo  - Frontend Web App: http://localhost:5173
echo  - Backend API Docs: http://localhost:8000/docs
echo =========================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
