# Smart Contract Deployment Guide

## Prerequisites

1. Install dependencies:
```bash
cd contracts
npm install
```

2. Set up environment variables in `contracts/.env`:
```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key_here
```

⚠️ **Security Note**: Never commit your private key to git!

## Compile Contract

```bash
npm run compile
```

This compiles the DonationRouter contract.

## Deploy to Polygon Amoy (Testnet)

1. Make sure you have testnet MATIC in your wallet
2. Get testnet MATIC from: https://faucet.polygon.technology/

3. Deploy:
```bash
npm run deploy:amoy
```

This will:
- Deploy the contract to Polygon Amoy testnet
- Display the contract address
- Optionally verify on Polygonscan (if configured)

## Deploy to Polygon Mainnet

⚠️ **Only deploy to mainnet when ready for production!**

1. Update `.env` with mainnet RPC URL:
```env
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_mainnet_wallet_private_key
```

2. Make sure you have MATIC for gas fees

3. Deploy:
```bash
npm run deploy:mainnet
```

## After Deployment

1. **Save the contract address** - You'll need this for:
   - Backend `.env` file: `CONTRACT_ADDRESS=0x...`
   - Frontend `.env.local` file: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`

2. **Verify on Block Explorer**:
   - Amoy: https://amoy.polygonscan.com/
   - Mainnet: https://polygonscan.com/

3. **Update Environment Variables**:
   - Backend: Add `CONTRACT_ADDRESS` to `backend/.env`
   - Frontend: Add `NEXT_PUBLIC_CONTRACT_ADDRESS` to `frontend/.env.local`

## Troubleshooting

### Error: "Trying to use a non-local installation of Hardhat"
**Solution**: Make sure you've run `npm install` in the contracts directory

### Error: "Insufficient funds"
**Solution**: Get testnet MATIC from the faucet or add mainnet MATIC to your wallet

### Error: "Network not found"
**Solution**: Check your `hardhat.config.js` has the correct network configuration

### Error: "Private key not set"
**Solution**: Make sure your `.env` file has `PRIVATE_KEY` set (without 0x prefix)

## Contract Verification (Optional)

After deployment, verify your contract on Polygonscan:

```bash
npx hardhat verify --network polygon-amoy <CONTRACT_ADDRESS>
```

This makes your contract source code publicly verifiable.


