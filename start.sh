#!/bin/bash

echo "========================================"
echo "   ShiftAid - Starting All Services"
echo "========================================"
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "[1/3] Installing root dependencies..."
    npm install
    echo ""
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[2/3] Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    echo ""
fi

if [ ! -d "backend/node_modules" ]; then
    echo "[3/3] Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo ""
fi

echo "========================================"
echo "   Starting Backend and Frontend"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm run start

