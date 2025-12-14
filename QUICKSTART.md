# ShiftAid Quick Start Guide

**For Judges and Reviewers** - Get ShiftAid running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed
- MetaMask browser extension

## Quick Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd ShiftAid

# Install all dependencies
npm run install:all
```

### 2. Configure Environment (1 minute)

**Backend** - Create `backend/.env`:
```env
USE_SUPABASE=true
SUPABASE_URL=https://dfqfvgvyhgbgoikkezdn.supabase.co
SUPABASE_DB_URL="postgresql://postgres.dfqfvgvyhgbgoikkezdn:Anubhav%237@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
PORT=3005
SIDESHIFT_API_KEY=your_key_here
SIDESHIFT_AFFILIATE_ID=your_id_here
POLYGON_RPC_URL=https://polygon-rpc.com
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
```

### 3. Seed Database (30 seconds)

```bash
npm run seed
```

### 4. Start Development Servers (30 seconds)

```bash
npm run dev
```

This starts both backend (port 3005) and frontend (port 3000) concurrently.

### 5. Open in Browser

- Frontend: http://localhost:3000
- Backend API: http://localhost:3005/health

## Testing the App

### Connect Wallet
1. Click "Connect Wallet" in the header
2. Approve MetaMask connection
3. Switch to Polygon network if prompted

### Make a Test Donation
1. Go to "Donate" page
2. Select an NGO from the dropdown
3. Choose a cryptocurrency (e.g., BTC, ETH)
4. Enter an amount
5. See the real-time quote
6. Click "Create Donation Order"
7. You'll get a deposit address to send crypto to

### View Dashboard
1. Go to "Dashboard" page
2. See donation statistics
3. View leaderboards
4. Track recent donations

## Key Features to Review

### 1. Cross-Chain Swaps
- Donate in any supported cryptocurrency
- NGOs receive stablecoins (USDC, USDT, DAI)
- Powered by SideShift API

### 2. Real-Time Quotes
- Live exchange rates
- Transparent fee display
- Instant quote updates

### 3. Transparent Tracking
- Every donation tracked on-chain
- Transaction hashes visible
- Status updates in real-time

### 4. User-Friendly Interface
- Clean, modern design
- Easy wallet connection
- Clear error messages
- Responsive layout

## Production Demo

**Live Demo**: https://shift-aid-new-frontend.vercel.app
**Backend API**: https://shiftaidnew.onrender.com

## Architecture Overview

```
┌─────────────┐
│   Frontend  │ (Next.js + React)
│  (Vercel)   │
└──────┬──────┘
       │
       │ REST API
       │
┌──────▼──────┐
│   Backend   │ (Node.js + Express)
│  (Render)   │
└──────┬──────┘
       │
       ├─────────► SideShift API (Crypto Swaps)
       │
       ├─────────► Supabase (Database)
       │
       └─────────► Polygon (Smart Contract)
```

## Key Technologies

- **Frontend**: Next.js 14, TailwindCSS, WalletConnect, React Query
- **Backend**: Node.js, Express, Axios
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Polygon, Hardhat, Ethers.js
- **API**: SideShift v2 for cross-chain swaps

## Wave 3 Improvements

### ✅ Mainnet Ready
- Polygon Mainnet configuration complete
- Environment variables for production
- Deploy scripts ready

### ✅ x-user-ip Header
- Middleware extracts user IP
- All SideShift calls include x-user-ip
- Proper proxy handling

### ✅ Frontend Polish
- Reusable WalletConnectButton component
- Fixed dropdown backgrounds and borders
- Better error handling for NGO loading
- Improved layout with header navigation

### ✅ Type Safety
- TypeScript types for frontend
- JSDoc types for backend
- Better IDE support

### ✅ Documentation
- Comprehensive README
- Deployment guide (DEPLOYMENT.md)
- Environment variable examples
- This quick start guide!

## Troubleshooting

### Backend won't start
- Check that port 3005 is available
- Verify Supabase credentials
- Run `npm install` in backend directory

### Frontend won't connect to backend
- Ensure backend is running on port 3005
- Check `NEXT_PUBLIC_API_URL` in frontend/.env.local
- Look for CORS errors in browser console

### Wallet won't connect
- Install MetaMask extension
- Unlock MetaMask
- Refresh the page

### NGOs not loading
- Run `npm run seed` to populate database
- Check backend logs for errors
- Verify Supabase connection

## Support

- **Documentation**: See README.md and DEPLOYMENT.md
- **Changes**: See CHANGES.md for all Wave 3 updates
- **Issues**: Check GitHub issues or create a new one

## Next Steps

1. **Review the code**: Check out the clean architecture
2. **Test the flow**: Make a test donation
3. **Check the docs**: Read DEPLOYMENT.md for production setup
4. **Deploy**: Follow the deployment guide to go live

---

**Thank you for reviewing ShiftAid!** 🙏

We've built a production-ready, cross-chain donation platform that makes crypto donations accessible to everyone while ensuring NGOs receive stable, usable funds instantly.

**Questions?** Feel free to reach out or open an issue on GitHub.
