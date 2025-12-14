# 🪙 ShiftAid – Cross-Chain Humanitarian Donation Router

A decentralized donation platform that lets anyone donate in any cryptocurrency, automatically converting it into the NGO's preferred stablecoin (like USDC on Polygon) using the SideShift API.

## 🌍 One-Line Description

A trustless, transparent, and borderless donation protocol powered by the SideShift API that enables instant crypto-to-stablecoin donations for NGOs worldwide.

## 💡 Core Concept

ShiftAid is a trustless, transparent, and borderless donation protocol powered by the SideShift API. Donors can send crypto from any supported chain or token, and NGOs instantly receive funds in a stablecoin of their choice without needing to handle multiple wallets, networks, or conversions.

This removes the complexity of crypto donations while ensuring transparency, speed, and direct wallet delivery to verified NGOs.

## 🎯 Problem Statement

Today, most charities and NGOs face major barriers to accepting cryptocurrency:

- They can't manage wallets across dozens of blockchains
- They lose value when manually swapping between assets
- Donors lack real-time proof of delivery and transparency
- Existing crypto donation platforms are often custodial or centralized, which creates trust issues and friction

## ✅ The ShiftAid Solution

ShiftAid fixes this with automatic, on-chain, cross-chain donation routing using the SideShift API.

When a donor contributes any crypto, ShiftAid:

1. Fetches a real-time quote from SideShift
2. Creates a swap order that converts the donated crypto to the NGO's stablecoin
3. Sends the converted funds directly to the NGO's verified wallet
4. Records the donation proof and transaction hash on-chain and on the ShiftAid dashboard

The result is an instant, auditable, and globally accessible donation system that requires no intermediaries and no manual swapping.

## ⚙️ Tech Stack

### Frontend
- **Next.js 14** – React framework for fast and scalable frontend
- **TailwindCSS** – clean and responsive UI styling
- **React Query** – manages live swap status and donation history
- **WalletConnect / MetaMask** – allows direct wallet donations
- **ShadCN UI components** – modern buttons, modals, and tables

### Backend
- **Node.js + Express** – REST API backend that connects frontend and SideShift API
- **MongoDB / Supabase** – stores NGO details, donation history, and swap logs
- **SideShift API v2** – main engine for swaps and conversions
- **Webhooks** – listens for order updates and swap confirmations in real time
- **dotenv + secure API key management** – protects sensitive credentials

### Blockchain Layer
- **Polygon Amoy Testnet** (or Polygon Mainnet) – for logging and verification
- **DonationRouter Smart Contract (Solidity)** – emits on-chain donation events (donor, amount, NGO, tx hash)
- **Chainlink Price Feeds (optional)** – for on-chain value proof of donations

## 🧩 How the System Works

1. User opens ShiftAid and connects their crypto wallet
2. Selects an NGO and chooses any cryptocurrency to donate
3. Backend calls the SideShift API to fetch the available swap pairs and live quote
4. User confirms the donation, and a swap order is created automatically
5. Donor sends crypto to the deposit address returned by SideShift
6. SideShift converts the donation into the NGO's preferred stablecoin (for example, MATIC → USDC.polygon)
7. NGO wallet receives funds directly
8. Webhook updates dashboard with real-time status and transaction details
9. Smart contract logs the donation proof for transparency and auditing

## 📊 Dashboard Features

- A live donation feed that shows all completed swaps and the crypto pairs used
- Each donation displays "From Token → To Stablecoin" with both transaction IDs
- A transparent leaderboard with total amounts donated and top contributors
- NGO verification badges showing verified wallet ownership
- A search bar and category filter for finding specific causes or campaigns
- AI summary panel showing weekly donation totals and impact metrics in plain text

## 🔐 Security and Trust

- The SideShift API key is stored only on the backend, never exposed to the browser
- Donations are non-custodial: funds flow directly from the donor to SideShift to the NGO wallet
- All donations are recorded on-chain for proof and transparency
- NGOs verify ownership of their wallets via digital signatures before being listed
- Each transaction can be independently verified through blockchain explorers and the SideShift order link

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (or Supabase account)
- SideShift API key
- MetaMask or compatible Web3 wallet
- Polygon Amoy Testnet configured in wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sideshift
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Set up environment variables:

**Backend (.env):**
```env
# Server Configuration
PORT=3005
NODE_ENV=production

# Database Configuration
USE_SUPABASE=true
SUPABASE_URL=your_supabase_project_url
SUPABASE_DB_URL=your_supabase_database_connection_string

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app

# SideShift API Configuration
SIDESHIFT_API_KEY=your_sideshift_api_key
SIDESHIFT_AFFILIATE_ID=your_affiliate_id
WEBHOOK_SECRET=your_webhook_secret

# Blockchain Configuration
# For Polygon Mainnet (Production)
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# For Polygon Amoy Testnet (Staging/Development)
# POLYGON_RPC_URL=https://rpc-amoy.polygon.technology

# Contract deployer private key (NEVER commit real keys!)
PRIVATE_KEY=your_private_key_here
```

**Frontend (.env.local):**
```env
# Backend API URL
# For production:
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# For local development:
# NEXT_PUBLIC_API_URL=http://localhost:3005

# Smart Contract Address (update after mainnet deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address

# Polygon RPC URL
# For production (Polygon Mainnet):
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

# For development (Polygon Amoy Testnet):
# NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

**Contracts (.env):**
```env
# Polygon Amoy Testnet (for staging/development)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology

# Polygon Mainnet (for production)
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Deployer private key (NEVER commit real keys!)
PRIVATE_KEY=your_private_key_here

# Optional: Polygonscan API key for contract verification
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### Environment Variables Reference

#### Backend Variables
- `PORT`: Server port (default: 3005)
- `NODE_ENV`: Environment mode (development/production)
- `USE_SUPABASE`: Use Supabase as database (true/false)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_DB_URL`: Supabase database connection string
- `FRONTEND_URL`: Frontend URL for CORS configuration
- `SIDESHIFT_API_KEY`: Your SideShift API key (required for swaps)
- `SIDESHIFT_AFFILIATE_ID`: Your SideShift affiliate ID (optional)
- `WEBHOOK_SECRET`: Secret for webhook verification
- `POLYGON_RPC_URL`: Polygon RPC endpoint (mainnet or testnet)
- `POLYGON_MAINNET_RPC_URL`: Polygon mainnet RPC endpoint
- `PRIVATE_KEY`: Private key for blockchain interactions

#### Frontend Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed DonationRouter contract address
- `NEXT_PUBLIC_POLYGON_RPC_URL`: Polygon RPC endpoint for frontend

#### Contracts Variables
- `POLYGON_RPC_URL`: Polygon Amoy testnet RPC URL
- `POLYGON_MAINNET_RPC_URL`: Polygon mainnet RPC URL
- `PRIVATE_KEY`: Deployer wallet private key
- `POLYGONSCAN_API_KEY`: API key for contract verification on Polygonscan

4. Deploy the smart contract:

**For Polygon Amoy Testnet (Staging):**
```bash
cd contracts
npm install
npx hardhat compile
npm run deploy:amoy
```

**For Polygon Mainnet (Production):**
```bash
cd contracts
npm install
npx hardhat compile
npm run deploy:mainnet
```

After deployment, copy the contract address and update:
- Backend `.env`: `CONTRACT_ADDRESS=<deployed_address>`
- Frontend `.env.local`: `NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed_address>`

5. Run the development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

## 🧠 SideShift API Endpoints Used

- `GET /coins` – to fetch the list of supported cryptocurrencies for donors
- `GET /quote` – to display the live conversion rate before the donation
- `POST /orders` – to create a donation swap order with settle address = NGO wallet
- `GET /orders/{id}` – to track the status and confirmations of each swap
- Webhook endpoint – to automatically update donation status and dashboard UI once SideShift confirms completion

## 💰 Example Flow

A user donates 0.02 Bitcoin to a listed NGO that prefers USDC on Polygon. ShiftAid checks via the SideShift API that BTC → USDC.polygon is available, fetches a quote, and creates a swap order. The user sends BTC to the SideShift deposit address. SideShift swaps it in real time and sends the converted USDC directly to the NGO's Polygon wallet. Within seconds, the dashboard updates showing: "0.02 BTC → 1,100 USDC delivered." The donor and NGO can both see transaction proofs.

## 🚀 Deployment Guide

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add all environment variables from Backend .env section above
6. Deploy and copy the service URL

### Frontend Deployment (Vercel)

1. Import your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Framework preset: Next.js
4. Add all environment variables from Frontend .env.local section above
5. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
6. Deploy

### Contract Deployment

1. Ensure you have MATIC in your deployer wallet
2. For testnet: Get MATIC from https://faucet.polygon.technology/
3. For mainnet: Ensure sufficient MATIC for gas fees
4. Run deployment command (see step 4 above)
5. Update contract address in backend and frontend .env files
6. Redeploy backend and frontend with new contract address

## 📋 Wave 3 Preparation Checklist

### Mainnet Readiness
- ✅ Polygon mainnet support added to Hardhat config
- ✅ Environment variables configured for mainnet
- ✅ Deploy script ready for mainnet deployment
- ⚠️ Update `.env` files with real mainnet values before deployment
- ⚠️ Deploy DonationRouter contract to Polygon mainnet
- ⚠️ Update frontend with mainnet contract address

### SideShift API Integration
- ✅ x-user-ip header added to all SideShift API calls
- ✅ x-api-key header added to all SideShift API calls
- ✅ IP extraction middleware implemented
- ✅ All endpoints pass user IP to SideShift
- ⚠️ Verify SideShift API key is valid and active
- ⚠️ Test all swap flows on production

### Frontend Polish
- ✅ Reusable WalletConnectButton component created
- ✅ Dropdown selectors have proper backgrounds and borders
- ✅ NGO loading error handling improved
- ✅ Header with wallet button added to all pages
- ✅ Better error messages for API failures
- ⚠️ Test all user flows end-to-end
- ⚠️ Verify responsive design on mobile devices

### Type Safety
- ✅ TypeScript types added for NGO, Donation, SideShift entities
- ✅ JSDoc types added to backend
- ⚠️ Consider adding more strict type checking

### Documentation
- ✅ Environment variables fully documented
- ✅ Deployment guide added
- ✅ Mainnet configuration explained
- ⚠️ Add troubleshooting section if needed

### Production Checklist
- [ ] Replace test private keys with secure production keys
- [ ] Verify all environment variables are set correctly
- [ ] Deploy contract to Polygon mainnet
- [ ] Update contract address in all configs
- [ ] Test donation flow with real crypto (small amounts first)
- [ ] Verify NGO wallet addresses are correct
- [ ] Test SideShift swaps with various coin pairs
- [ ] Monitor backend logs for errors
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Verify frontend connects to correct backend URL
- [ ] Test wallet connection on multiple browsers
- [ ] Verify transaction tracking works correctly

## 🏁 Future Roadmap

- Recurring donations using smart contract subscriptions
- AI donation advisor suggesting causes based on donor interest or region
- NFT Impact Badges minted for each donor as proof of contribution
- Campaign splits allowing donations to be auto-divided among multiple NGOs
- Public Impact Analytics API so anyone can display live donation stats
- Multi-language support for global accessibility
- Mobile app for iOS and Android
- Integration with more DEX aggregators for better rates

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


