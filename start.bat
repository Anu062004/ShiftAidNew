@echo off
echo ========================================
echo    ShiftAid - Starting All Services
echo ========================================
echo.

REM Check if node_modules exist
if not exist "node_modules" (
    echo [1/3] Installing root dependencies...
    call npm install
    echo.
)

if not exist "frontend\node_modules" (
    echo [2/3] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

if not exist "backend\node_modules" (
    echo [3/3] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

echo ========================================
echo    Starting Backend and Frontend
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop all services
echo.

call npm run start

