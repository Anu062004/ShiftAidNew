# Quick Start Guide

Get ShiftAid running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ MongoDB running (local or Atlas)
- ✅ SideShift API key ready
- ✅ MetaMask installed with Polygon Amoy testnet

## Step 1: Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
```

## Step 2: Configure Environment

### Backend

Create `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shiftaid
SIDESHIFT_API_KEY=your_key_here
SIDESHIFT_API_URL=https://api.sideshift.ai/v2
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

### Frontend

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

## Step 3: Start Services

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 4: Seed Data (Optional)

```bash
cd backend
npm run seed
```

This creates sample NGOs for testing.

## Step 5: Open Application

Visit: `http://localhost:3000`

## Next Steps

1. Connect your wallet (MetaMask)
2. Go to "Donate" page
3. Select an NGO
4. Choose cryptocurrency and amount
5. Create donation order
6. Send crypto to deposit address
7. Monitor status

## Troubleshooting

**Backend won't start?**
- Check MongoDB is running
- Verify `.env` file exists

**Frontend won't start?**
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf .next node_modules && npm install`

**Wallet won't connect?**
- Ensure MetaMask is installed
- Add Polygon Amoy testnet to MetaMask
- Check network is selected

**API errors?**
- Verify SideShift API key is correct
- Check backend is running on port 3001
- Review backend console for errors

## Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup
- Review [API.md](./API.md) for API documentation
- Check backend/frontend console logs


