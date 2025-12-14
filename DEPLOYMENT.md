# ShiftAid Deployment Guide

This guide walks you through deploying ShiftAid to production on Polygon Mainnet.

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)
- [ ] Supabase account (for database)
- [ ] SideShift API key
- [ ] Wallet with MATIC on Polygon Mainnet (for contract deployment)
- [ ] MetaMask or compatible wallet

## Step 1: Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the connection string (URI format)
4. Run the schema from `backend/supabase-schema.sql` in the SQL Editor
5. Save the following for later:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_DB_URL`: Your database connection string

## Step 2: SideShift API Setup

1. Sign up at https://sideshift.ai/
2. Generate an API key from your dashboard
3. (Optional) Set up an affiliate ID
4. Save the following for later:
   - `SIDESHIFT_API_KEY`: Your API key
   - `SIDESHIFT_AFFILIATE_ID`: Your affiliate ID (optional)

## Step 3: Smart Contract Deployment

### Prepare Deployment Wallet

1. Create a new wallet or use an existing one
2. **IMPORTANT**: Never use your main wallet for deployment
3. Fund the wallet with MATIC on Polygon Mainnet
   - Recommended: 5-10 MATIC for deployment and gas fees
   - Get MATIC from exchanges like Binance, Coinbase, etc.

### Deploy to Polygon Mainnet

1. Navigate to contracts directory:
   ```bash
   cd contracts
   npm install
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Update `contracts/.env`:
   ```env
   POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
   PRIVATE_KEY=your_deployer_wallet_private_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

4. Compile contracts:
   ```bash
   npx hardhat compile
   ```

5. Deploy to Polygon Mainnet:
   ```bash
   npm run deploy:mainnet
   ```

6. **SAVE THE CONTRACT ADDRESS** - you'll need it for backend and frontend!

7. Verify the contract on Polygonscan (optional but recommended):
   ```bash
   npx hardhat verify --network polygon <CONTRACT_ADDRESS>
   ```

## Step 4: Backend Deployment (Render)

### Create Render Service

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: shiftaid-backend (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter (upgrade as needed)

### Set Environment Variables

In Render dashboard, add these environment variables:

```env
PORT=3005
NODE_ENV=production
USE_SUPABASE=true
SUPABASE_URL=<from_step_1>
SUPABASE_DB_URL=<from_step_1>
FRONTEND_URL=<will_update_after_frontend_deployment>
SIDESHIFT_API_KEY=<from_step_2>
SIDESHIFT_AFFILIATE_ID=<from_step_2>
WEBHOOK_SECRET=<generate_random_string>
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=<your_deployer_private_key>
CONTRACT_ADDRESS=<from_step_3>
```

### Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. **SAVE THE SERVICE URL** (e.g., https://shiftaid-backend.onrender.com)
4. Test the health endpoint: `https://your-backend-url.onrender.com/health`

## Step 5: Frontend Deployment (Vercel)

### Create Vercel Project

1. Go to https://vercel.com and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Set Environment Variables

In Vercel dashboard, add these environment variables:

```env
NEXT_PUBLIC_API_URL=<backend_url_from_step_4>
NEXT_PUBLIC_CONTRACT_ADDRESS=<contract_address_from_step_3>
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
```

### Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. **SAVE THE DEPLOYMENT URL** (e.g., https://shiftaid.vercel.app)

### Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend service

## Step 6: Seed Database with NGOs

### Option A: Use Seed Script

1. Update `backend/src/scripts/seed.js` with real NGO data
2. Run locally with production database:
   ```bash
   cd backend
   # Set SUPABASE_DB_URL in .env
   npm run seed
   ```

### Option B: Manual Entry

1. Use the NGO registration endpoint:
   ```bash
   curl -X POST https://your-backend-url.onrender.com/api/ngos \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Example NGO",
       "description": "Helping communities worldwide",
       "category": "Healthcare",
       "walletAddress": "0x...",
       "preferredCoin": "USDC.polygon",
       "website": "https://example.org"
     }'
   ```

2. Verify NGOs (admin action):
   ```bash
   curl -X PATCH https://your-backend-url.onrender.com/api/ngos/<NGO_ID>/verify
   ```

## Step 7: Testing

### Test Checklist

- [ ] Frontend loads correctly
- [ ] Wallet connection works (MetaMask)
- [ ] NGO list displays properly
- [ ] Can select NGO and cryptocurrency
- [ ] Quote fetches successfully
- [ ] Can create donation order
- [ ] Deposit address is generated
- [ ] Can send crypto to deposit address
- [ ] Donation status updates correctly
- [ ] NGO receives stablecoins
- [ ] Dashboard shows donation stats
- [ ] All links work correctly

### Test with Small Amounts First!

1. Connect your wallet to the frontend
2. Select a test NGO (or create one with your own wallet)
3. Donate a small amount (e.g., $5-10 worth)
4. Verify the swap completes successfully
5. Check that the NGO wallet received the stablecoins

## Step 8: Monitoring and Maintenance

### Set Up Monitoring

1. **Render**: Enable auto-deploy on push
2. **Vercel**: Enable auto-deploy on push
3. **Sentry** (optional): Add error tracking
4. **Uptime monitoring**: Use UptimeRobot or similar

### Regular Checks

- Monitor backend logs in Render dashboard
- Check Supabase database for donation records
- Verify SideShift API key is active
- Monitor gas prices and adjust if needed
- Check for failed donations and investigate

### Backup Strategy

1. Regular database backups (Supabase handles this)
2. Keep contract source code in version control
3. Document all environment variables securely
4. Save contract addresses and deployment transactions

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Check Supabase connection string

**Problem**: CORS errors
- Verify `FRONTEND_URL` matches your Vercel deployment
- Check that frontend is using correct `NEXT_PUBLIC_API_URL`

### Frontend Issues

**Problem**: Can't connect wallet
- Ensure MetaMask is installed
- Check that user is on Polygon network
- Verify contract address is correct

**Problem**: NGOs not loading
- Check backend `/api/ngos` endpoint
- Verify database has NGO records
- Check browser console for errors

### SideShift Issues

**Problem**: Quote fails
- Verify `SIDESHIFT_API_KEY` is valid
- Check that coin pair is supported
- Ensure x-user-ip header is being sent

**Problem**: Swap not completing
- Check SideShift order status
- Verify deposit was sent to correct address
- Check that deposit amount meets minimum

## Security Checklist

- [ ] Private keys are never committed to Git
- [ ] Environment variables are set securely
- [ ] CORS is configured correctly
- [ ] API endpoints have proper validation
- [ ] Wallet addresses are validated
- [ ] Rate limiting is enabled (if needed)
- [ ] HTTPS is enforced on all endpoints
- [ ] Database credentials are secure
- [ ] Regular security audits scheduled

## Post-Deployment

1. Announce the launch on social media
2. Share the demo link with judges/users
3. Monitor for any issues in the first 24 hours
4. Gather user feedback
5. Plan for future improvements

## Support

If you encounter issues:
1. Check the logs in Render/Vercel dashboards
2. Review this deployment guide
3. Check the main README.md for additional info
4. Open an issue on GitHub

---

**Congratulations!** 🎉 Your ShiftAid application is now live on Polygon Mainnet!
