# Quick Fix: MongoDB Connection Error

## The Problem
```
MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
```
MongoDB is not running or not accessible.

## ⚡ Quickest Solution: MongoDB Atlas (5 minutes)

### Step 1: Create Free MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)

### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Choose **"M0 FREE"** (Free forever)
3. Select any cloud provider/region
4. Click "Create"

### Step 3: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Username: `shiftaid` (or any name)
3. Password: Create a strong password (save it!)
4. Click "Add User"

### Step 4: Allow Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click **"Allow Access from Anywhere"** (for development)
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
   - Looks like: `mongodb+srv://shiftaid:<password>@cluster0.xxxxx.mongodb.net/`

### Step 6: Update backend/.env
Create or edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://shiftaid:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/shiftaid?retryWrites=true&w=majority
```
**Replace:**
- `YOUR_PASSWORD` with your actual password
- `cluster0.xxxxx` with your actual cluster address

### Step 7: Run Seed
```bash
npm run seed
```

✅ Done! Your NGOs will be seeded.

---

## Alternative: Install MongoDB Locally

### Windows
1. Download: https://www.mongodb.com/try/download/community
2. Install (use default settings)
3. MongoDB runs as Windows service automatically
4. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/shiftaid
   ```
5. Run: `npm run seed`

### Check if MongoDB is Running
```powershell
Get-Service MongoDB
```

If not running:
```powershell
Start-Service MongoDB
```

---

## Need Help?

If you still get errors:
1. Check `backend/.env` has `MONGODB_URI` set
2. Verify connection string is correct
3. Make sure no firewall is blocking
4. Try the API seeding method (see SEED_DATA.md)


