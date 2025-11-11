# ShiftAid Setup Guide

This guide will help you set up and run ShiftAid locally.

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud like MongoDB Atlas)
- SideShift API key ([Get one here](https://sideshift.ai))
- MetaMask or compatible Web3 wallet
- Polygon Amoy Testnet configured in wallet

## Step 1: Clone and Install

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install contract dependencies
cd ../contracts
npm install
```

## Step 2: Configure Environment Variables

### Backend Configuration

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

### Frontend Configuration

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

### Contracts Configuration

Create `contracts/.env` file:

```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_contract_deployer_private_key_here
```

## Step 3: Deploy Smart Contract

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon-amoy
```

Copy the deployed contract address and add it to your `.env` files.

## Step 4: Set Up MongoDB

### Option A: Local MongoDB

Install MongoDB locally and start it:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

## Step 5: Get SideShift API Key

1. Visit [SideShift.ai](https://sideshift.ai)
2. Sign up or log in
3. Navigate to API settings
4. Generate an API key
5. Copy your API key and affiliate ID (if available)
6. Add them to `backend/.env`

## Step 6: Configure Webhook (Optional)

For production, set up webhook endpoint:

1. Configure your webhook URL in SideShift dashboard
2. Use: `https://your-domain.com/api/webhooks/sideshift`
3. Set `WEBHOOK_SECRET` in `backend/.env`

## Step 7: Run the Application

### Development Mode

From the root directory:

```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 8: Seed Initial Data (Optional)

You can manually add NGOs through the API or create a seed script:

```bash
# Example using curl
curl -X POST http://localhost:3001/api/ngos \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example NGO",
    "description": "An example NGO for testing",
    "category": "Education",
    "walletAddress": "0x...",
    "preferredCoin": "USDC.polygon",
    "website": "https://example.org"
  }'
```

Then verify the NGO (admin action):

```bash
curl -X PATCH http://localhost:3001/api/ngos/{ngoId}/verify
```

## Step 9: Test the Application

1. Open `http://localhost:3000`
2. Connect your wallet (MetaMask with Polygon Amoy testnet)
3. Navigate to "Donate" page
4. Select an NGO and cryptocurrency
5. Enter donation amount
6. Review quote and create donation order
7. Send crypto to the deposit address
8. Monitor status on the donation page

## Troubleshooting

### Backend won't start

- Check MongoDB is running
- Verify all environment variables are set
- Check port 3001 is not in use

### Frontend won't start

- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Smart contract deployment fails

- Verify you have testnet MATIC in your wallet
- Check RPC URL is correct
- Ensure private key has funds

### API calls fail

- Verify SideShift API key is correct
- Check backend is running
- Check CORS settings in backend

### Wallet connection issues

- Ensure MetaMask is installed
- Add Polygon Amoy testnet to MetaMask
- Check network is selected in wallet

## Production Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Render/Railway)

1. Connect GitHub repository
2. Set build command: `cd backend && npm install`
3. Set start command: `cd backend && npm start`
4. Add environment variables
5. Deploy

### Smart Contract

1. Update `hardhat.config.js` with mainnet RPC
2. Deploy: `npx hardhat run scripts/deploy.js --network polygon`
3. Verify on Polygonscan
4. Update contract address in environment variables

## Support

For issues or questions:
- Check [SideShift API Docs](https://docs.sideshift.ai/)
- Review error logs in console
- Check MongoDB connection
- Verify API keys are correct


