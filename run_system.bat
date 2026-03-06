@echo off
REM Farm Vision Monitoring System - Setup & Run Script (Windows)
REM This script sets up and starts all services on Windows
REM Usage: run_system.bat

setlocal enabledelayedexpansion

echo ================================================
echo  Farm Vision Monitoring System - Windows Setup
echo ================================================
echo.

REM Colors for output (using title for important messages)
echo [*] Checking prerequisites...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Found Node.js %NODE_VER%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo [OK] Found npm %NPM_VER%

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where python3 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Python 3 is not installed
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)
for /f "tokens=*" %%i in ('%PYTHON_CMD% --version') do set PYTHON_VER=%%i
echo [OK] Found %PYTHON_VER%

echo.
echo [*] Setting up Backend Express Server...
if not exist "backend\" (
    echo [ERROR] backend directory not found
    exit /b 1
)

cd backend
if not exist "node_modules\" (
    call npm install
)
echo [OK] Backend dependencies installed
cd ..

echo.
echo [*] Setting up FarmVisionAI Vision Service...
if not exist "FarmVisionAI\" (
    echo [ERROR] FarmVisionAI directory not found
    exit /b 1
)

cd FarmVisionAI

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
    call %PYTHON_CMD% -m venv venv
    echo [OK] Python virtual environment created
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
call pip install -r requirements.txt --quiet
echo [OK] Python dependencies installed

REM Create .env from template if it doesn't exist
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] .env created from template
    ) else (
        echo [ERROR] .env.example not found
        exit /b 1
    )
)

cd ..

echo.
echo [*] Setting up Frontend React App...
if not exist "frontend\" (
    echo [ERROR] frontend directory not found
    exit /b 1
)

cd frontend
if not exist "node_modules\" (
    call npm install
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo ================================================
echo [OK] All Setup Complete!
echo ================================================
echo.

REM Create logs directory
if not exist "logs\" mkdir logs

echo.
echo [*] Starting Services...
echo.

echo [*] Starting Backend Express Server (Port 3000)...
cd backend
start "Backend Express" cmd /k "npm run dev"
cd ..
timeout /t 2 /nobreak
echo [OK] Backend started (Port 3000)

echo [*] Starting Vision Service (Port 5000)...
cd FarmVisionAI
call venv\Scripts\activate.bat
start "Vision Service" cmd /k "python final.py"
cd ..
timeout /t 2 /nobreak
echo [OK] Vision Service started (Port 5000)

echo [*] Starting Frontend Dev Server (Port 5173)...
cd frontend
start "Frontend React" cmd /k "npm run dev"
cd ..

echo.
echo ================================================
echo [OK] All Services Running!
echo ================================================
echo.

echo Service URLs:
echo   - Backend Express:    http://localhost:3000
echo   - Vision Service:     http://localhost:5000
echo   - Frontend React:     http://localhost:5173
echo.

echo Health Check URLs (open in browser or use curl):
echo   - System Health:      http://localhost:3000/api/system/health
echo   - Vision Health:      http://localhost:5000/health
echo   - Vision Metrics:     http://localhost:5000/metrics
echo.

echo Configuration Files:
echo   - Backend:   backend\.env
echo   - Vision:    FarmVisionAI\.env (update CAMERA_SOURCE if needed)
echo   - Frontend:  No config needed
echo.

echo Note:
echo   - Three terminal windows should open automatically
echo   - If they don't, manually run:
echo     - Terminal 1: cd backend && npm run dev
echo     - Terminal 2: cd FarmVisionAI && python final.py
echo     - Terminal 3: cd frontend && npm run dev
echo.

pause
