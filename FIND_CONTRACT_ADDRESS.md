# Contract Address Guide

## 📍 Current Status

**The contract has NOT been deployed yet.** You need to deploy it first to get a contract address.

## 🚀 How to Deploy and Get Contract Address

### Step 1: Set Up Environment

Create `contracts/.env` file:

```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key_here
```

**Important:** 
- Use a wallet with testnet MATIC (for Polygon Amoy testnet)
- Get testnet MATIC from: https://faucet.polygon.technology/

### Step 2: Deploy to Polygon Amoy (Testnet)

```bash
cd contracts
npm run deploy:amoy
```

Or from root:
```bash
npm run deploy:amoy
```

### Step 3: Copy the Contract Address

After deployment, you'll see output like:

```
✅ DonationRouter deployed to: 0x1234567890123456789012345678901234567890
📝 Save this address in your .env file as CONTRACT_ADDRESS
```

**Copy this address!**

### Step 4: Update Environment Variables

Add the contract address to:

**Backend (`backend/.env`):**
```env
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## 🔍 Where Contract Address is Used

1. **Backend** (`backend/src/utils/blockchain.js`):
   - Used to log donations on-chain
   - Reads from `CONTRACT_ADDRESS` env variable

2. **Frontend** (`frontend/app/providers.tsx` or other components):
   - Used to display contract info
   - Reads from `NEXT_PUBLIC_CONTRACT_ADDRESS` env variable

## 📝 Quick Deploy Command

From root directory:
```bash
npm run deploy:amoy
```

This will:
1. Compile the contract
2. Deploy to Polygon Amoy testnet
3. Show you the contract address
4. Optionally verify on Polygonscan

## 🔗 View on Block Explorer

After deployment, view your contract on:
- **Polygon Amoy**: https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
- **Polygon Mainnet**: https://polygonscan.com/address/YOUR_CONTRACT_ADDRESS

## ⚠️ Important Notes

- **Testnet**: Use Polygon Amoy for testing (free testnet MATIC)
- **Mainnet**: Deploy to Polygon mainnet only when ready for production
- **Private Key**: Never share your private key or commit it to git
- **Gas Fees**: You need MATIC in your wallet to pay for deployment

## 🎯 Summary

1. Deploy contract: `npm run deploy:amoy`
2. Copy the address from the output
3. Add to `backend/.env` and `frontend/.env.local`
4. Restart servers

That's it! Your contract address will be ready to use.

