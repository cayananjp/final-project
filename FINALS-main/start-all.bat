@echo off
REM SavorSense - Start All Servers Script (Windows)
REM This script starts both the frontend and backend servers

echo 🚀 Starting SavorSense...
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ❌ Error: backend directory not found
    exit /b 1
)

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Start backend in new window
echo 🔧 Starting backend server...
start "SavorSense Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
echo 🎨 Starting frontend server...
start "SavorSense Frontend" cmd /k "npm start"

echo.
echo ✅ Both servers are starting!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:5000
echo.
echo Close the terminal windows to stop the servers
echo.

pause
