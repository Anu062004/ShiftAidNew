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
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SIDESHIFT_API_KEY=your_sideshift_api_key
SIDESHIFT_AFFILIATE_ID=your_affiliate_id
WEBHOOK_SECRET=your_webhook_secret
POLYGON_RPC_URL=your_polygon_rpc_url
PRIVATE_KEY=your_contract_deployer_private_key
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_POLYGON_RPC_URL=your_polygon_rpc_url
```

4. Deploy the smart contract:
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat deploy --network polygon-amoy
```

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

## 🏁 Future Roadmap

- Recurring donations using smart contract subscriptions
- AI donation advisor suggesting causes based on donor interest or region
- NFT Impact Badges minted for each donor as proof of contribution
- Campaign splits allowing donations to be auto-divided among multiple NGOs
- Public Impact Analytics API so anyone can display live donation stats

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


