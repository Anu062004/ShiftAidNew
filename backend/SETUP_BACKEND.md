# Backend Setup Guide

## ✅ Backend Structure

Your backend is already created with:
- ✅ Express server (`src/server.js`)
- ✅ MongoDB models (NGO, Donation)
- ✅ API routes (donations, NGOs, SideShift, webhooks, dashboard)
- ✅ SideShift API integration
- ✅ Webhook handlers
- ✅ Seed scripts

## 🚀 Quick Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create .env File

Create `backend/.env` file:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shiftaid
SIDESHIFT_API_KEY=your_sideshift_api_key_here
SIDESHIFT_AFFILIATE_ID=your_affiliate_id_here
SIDESHIFT_API_URL=https://api.sideshift.ai/v2
WEBHOOK_SECRET=your_webhook_secret_here
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_contract_deployer_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address_here
NODE_ENV=development
```

**Minimum required for basic setup:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shiftaid
```

### 3. Start MongoDB (if not running)

**Windows:**
```powershell
# Check if running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB
```

**Or start manually:**
```bash
mongod
```

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 3001
```

### 5. Test Backend

Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

### 6. Seed Mock NGOs

In a new terminal:
```bash
cd backend
npm run seed
```

You should see:
```
🌱 Starting seed...
✅ Connected to MongoDB
✅ Created NGO: Education for All Foundation
✅ Created NGO: Global Health Initiative
...
🎉 Seed completed successfully!
```

## 📁 Backend Structure

```
backend/
├── src/
│   ├── server.js           # Main Express server
│   ├── models/             # MongoDB models
│   │   ├── NGO.js
│   │   └── Donation.js
│   ├── routes/             # API routes
│   │   ├── donations.js
│   │   ├── ngos.js
│   │   ├── sideshift.js
│   │   ├── webhooks.js
│   │   └── dashboard.js
│   ├── config/             # Configuration
│   │   └── sideshift.js    # SideShift API client
│   ├── utils/              # Utilities
│   │   └── blockchain.js   # On-chain logging
│   └── scripts/            # Scripts
│       ├── seed.js         # Database seeding
│       └── seed-via-api.js    # API-based seeding
├── package.json
└── .env                    # Environment variables (create this)
```

## 🔧 API Endpoints

Once running, these endpoints are available:

- `GET /health` - Health check
- `GET /api/ngos` - List all NGOs
- `POST /api/ngos` - Create NGO
- `GET /api/ngos/:id` - Get NGO by ID
- `GET /api/sideshift/coins` - Get supported coins
- `GET /api/sideshift/quote` - Get swap quote
- `POST /api/donations` - Create donation
- `GET /api/donations` - List donations
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/webhooks/sideshift` - SideShift webhook

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `connect ECONNREFUSED`

**Solutions:**
1. Check MongoDB is running:
   ```powershell
   Get-Service MongoDB
   ```

2. Start MongoDB:
   ```powershell
   Start-Service MongoDB
   ```

3. Or use MongoDB Atlas (cloud):
   - Update `MONGODB_URI` in `.env` with Atlas connection string

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
- Change `PORT` in `.env` to another port (e.g., `3002`)
- Or stop the process using port 3001

### Module Not Found

**Error:** `Cannot find module`

**Solution:**
```bash
cd backend
npm install
```

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with `MONGODB_URI`
- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] NGOs seeded successfully

## 🎯 Next Steps

After backend is running:

1. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Test Full Flow:**
   - Open http://localhost:3000
   - Connect wallet
   - Go to Donate page
   - Select NGO
   - Create donation order

## 📝 Notes

- Backend runs on port 3001 by default
- MongoDB database name: `shiftaid`
- All routes are prefixed with `/api`
- CORS is enabled for frontend (localhost:3000)

