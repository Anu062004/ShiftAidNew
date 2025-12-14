# ShiftAid

**Donate any crypto. NGOs get stablecoins. Simple as that.**

ShiftAid is a donation platform that solves a real problem: charities want to accept crypto donations, but managing wallets across multiple chains is a nightmare. We built this to make crypto donations as easy as sending a Venmo payment, while keeping everything transparent and on-chain.

## What Problem Are We Solving?

Most NGOs can't handle crypto donations because:
- They'd need wallets on Bitcoin, Ethereum, Polygon, Arbitrum, and dozens of other chains
- Manual swapping between tokens is expensive and time-consuming
- Donors have no way to verify their money actually reached the charity
- Existing platforms are either custodial (they hold your funds) or too complicated

ShiftAid fixes this by automatically converting any cryptocurrency into the stablecoin the NGO prefers. You send BTC, ETH, or whatever you have. They receive USDC on Polygon (or their preferred network). The conversion happens instantly via SideShift, and everything is recorded on-chain so you can verify it yourself.

## How It Works

The flow is pretty straightforward:

1. **Connect your wallet** - MetaMask, WalletConnect, or any Web3 wallet
2. **Pick an NGO** - Browse verified organizations by category
3. **Choose your crypto** - Donate in whatever you have (BTC, ETH, MATIC, USDC, etc.)
4. **Get a quote** - See exactly how much the NGO will receive in real-time
5. **Send it** - Your crypto goes to SideShift, they convert it, and the stablecoin lands directly in the NGO's wallet
6. **Track it** - Every transaction is on-chain and visible on our dashboard

The whole process takes about 30 seconds, and the NGO gets their funds within minutes.

## Tech Stack

We went with a pretty standard modern stack:

**Frontend:**
- Next.js 14 (App Router) - Fast, server-rendered React
- Tailwind CSS - Because writing custom CSS is overrated
- Wagmi + Viem - Wallet connection and Web3 interactions
- React Query - For managing API state and caching
- TypeScript - Because JavaScript errors at runtime are annoying

**Backend:**
- Node.js + Express - Simple REST API
- Supabase - PostgreSQL database (we started with MongoDB but switched)
- SideShift API - Handles all the cross-chain swaps
- Webhooks - Real-time updates when swaps complete

**Smart Contracts:**
- Solidity on Polygon - Records donation events on-chain
- Hardhat - Development and deployment

## Getting Started

### Prerequisites

You'll need:
- Node.js 18+ (we're using 18.17.0)
- A SideShift API key ([get one here](https://sideshift.ai))
- A Supabase account (free tier works fine)
- MetaMask or another Web3 wallet
- Some testnet MATIC for development

### Installation

Clone the repo:
```bash
git clone https://github.com/Anu062004/ShiftAidNew.git
cd ShiftAidNew
```

Install everything:
```bash
npm run install:all
```

This installs dependencies for the root, frontend, backend, and contracts. Takes a minute or two.

### Environment Setup

You'll need to set up environment variables in three places:

**Backend (`backend/.env`):**
```env
PORT=3005
USE_SUPABASE=true
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE=your_service_role_key
SIDESHIFT_API_KEY=your_sideshift_api_key
SIDESHIFT_SECRET=your_sideshift_secret
AFFILIATE_ID=your_affiliate_id
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

**Contracts (`contracts/.env`):**
```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_deployer_wallet_private_key
```

**Important:** Never commit your `.env` files. We have `.env.example` files in each directory as templates.

### Database Setup

If you're using Supabase (recommended):

1. Create a new Supabase project
2. Run the schema from `backend/supabase-schema.sql` in your Supabase SQL editor
3. Copy your project URL and service role key to `backend/.env`

The schema creates tables for NGOs, donations, and dashboard stats. Pretty straightforward.

### Seed Some Test Data

We included a seed script to populate some NGOs for testing:

```bash
npm run seed
```

This adds a few sample NGOs with verified wallet addresses. You can modify `backend/src/scripts/seed.js` to add your own.

### Deploy the Smart Contract

For development, deploy to Polygon Amoy testnet:

```bash
cd contracts
npm install
npx hardhat compile
npm run deploy:amoy
```

Copy the deployed contract address and add it to your frontend `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Run the App

From the root directory:
```bash
npm run dev
```

This starts both the backend (port 3005) and frontend (port 3000) concurrently. The frontend will automatically connect to the backend.

Open `http://localhost:3000` and you should see the app. Connect your wallet (make sure you're on Polygon Amoy testnet) and try making a donation!

## Project Structure

```
ShiftAidNew/
├── frontend/          # Next.js app
│   ├── app/          # Pages and routes
│   ├── components/   # React components
│   └── lib/          # API client and utilities
├── backend/          # Express API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── config/   # SideShift config
│   │   └── utils/    # Helper functions
├── contracts/        # Solidity smart contracts
│   └── contracts/    # DonationRouter.sol
└── package.json      # Root workspace config
```

## Key Features

**For Donors:**
- Donate in any supported cryptocurrency
- Real-time conversion quotes before you commit
- Full transaction history with blockchain links
- See exactly where your money goes

**For NGOs:**
- Receive donations in your preferred stablecoin
- No need to manage multiple wallets
- Automatic conversion at competitive rates
- Transparent, verifiable donation records

**For Everyone:**
- Non-custodial - we never hold your funds
- On-chain transparency - verify everything yourself
- Real-time status updates via webhooks
- Beautiful, accessible UI (WCAG AA compliant)

## SideShift Integration

We're using SideShift's API for all swaps. It's pretty solid - they support tons of chains and tokens, and the rates are competitive. The integration is straightforward:

- `GET /coins` - List all supported cryptocurrencies
- `GET /quote` - Get conversion rate for a pair
- `POST /orders` - Create a swap order
- Webhooks - Get notified when swaps complete

The API key stays on the backend (never exposed to the frontend), and we pass the user's IP address in the `x-user-ip` header as required by SideShift.

## Deployment

We've deployed this to:
- **Frontend:** Vercel (automatic deployments from main branch)
- **Backend:** Render (web service)
- **Contract:** Polygon Amoy testnet (will move to mainnet for production)

The deployment process is pretty standard:
1. Set environment variables in your hosting platform
2. Connect your GitHub repo
3. Deploy

For Vercel, make sure to set the root directory to `frontend`. For Render, point it to the `backend` directory.

## Development Notes

**Common Issues:**
- If the backend won't start, check that port 3005 isn't already in use
- SideShift API requires the `x-user-ip` header - we handle this automatically
- Make sure your wallet is connected to the right network (Amoy for dev, Mainnet for prod)
- The frontend needs the backend URL in `NEXT_PUBLIC_API_URL` or API calls will fail

**Testing:**
- We're using Polygon Amoy testnet for development
- Get testnet MATIC from the [Polygon faucet](https://faucet.polygon.technology/)
- Test with small amounts first (like 0.001 ETH)

**TypeScript:**
- Frontend is fully typed
- Backend uses JSDoc types (we might migrate to TypeScript later)
- Types are defined in `frontend/lib/types.ts`

## What's Next?

We have a few ideas for future improvements:
- Recurring donations (monthly subscriptions)
- NFT impact badges for donors
- Multi-NGO campaign splits
- Mobile app
- More DEX integrations for better rates

But honestly, the core functionality is solid. The main thing is getting more NGOs onboarded and making sure the donation flow is smooth.

## Contributing

Found a bug? Have an idea? PRs are welcome. Just make sure to:
- Follow the existing code style
- Add TypeScript types where needed
- Test your changes locally
- Update docs if you change something significant

## License

MIT - do whatever you want with it.

## Questions?

If something's not working or you have questions, check the `TROUBLESHOOTING.md` file first. If that doesn't help, open an issue on GitHub.

---

Built for the SideShift Buildathon. Made with ❤️ for making crypto donations actually usable.
