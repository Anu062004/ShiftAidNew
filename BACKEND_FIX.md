# Backend 404 Error Fix

## Problem
The frontend was getting 404 errors for:
- `/api/sideshift/coins`
- `/api/ngos?verified=true`

## Root Cause
The backend server was crashing because port 3001 was already in use by another process.

## Solution Applied

1. **Killed the process blocking port 3001** (PID 22760, then 6576)
2. **Fixed the kill-port script** to handle cases where no process is found
3. **Started the backend server**

## How to Start Backend Now

```bash
cd backend
npm run dev
```

The `predev` script will automatically:
1. Kill any process using port 3001
2. Wait 1 second for the port to be released
3. Start the backend server

## Verify Backend is Running

1. Check the terminal - you should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port 3001
   ```

2. Test the API endpoints:
   - Health: `http://localhost:3001/health`
   - NGOs: `http://localhost:3001/api/ngos?verified=true`
   - Coins: `http://localhost:3001/api/sideshift/coins`

## If Backend Still Doesn't Start

1. **Check if MongoDB is running**:
   ```powershell
   Get-Service MongoDB
   ```

2. **Check if port 3001 is free**:
   ```powershell
   netstat -ano | findstr :3001
   ```

3. **Manually kill any process on port 3001**:
   ```powershell
   # Find PID
   netstat -ano | findstr :3001
   # Kill it
   taskkill /F /PID <PID>
   ```

4. **Check backend/.env file exists** with:
   - `MONGODB_URI`
   - `SIDESHIFT_SECRET`
   - `AFFILIATE_ID`

## Next Steps

Once the backend is running:
1. Refresh your frontend browser
2. The Select dropdowns should now populate with data
3. You should be able to select NGOs and cryptocurrencies


