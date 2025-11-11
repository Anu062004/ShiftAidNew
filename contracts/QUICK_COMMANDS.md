# Quick Commands Reference

## Available Scripts

### Compile Contract
```bash
npm run compile
```
Compiles the DonationRouter smart contract.

### Deploy to Testnet (Polygon Amoy)
```bash
npm run deploy:amoy
```
Deploys the contract to Polygon Amoy testnet.

**Prerequisites:**
- Set `PRIVATE_KEY` in `.env` file
- Have testnet MATIC in your wallet (get from https://faucet.polygon.technology/)

### Deploy to Mainnet (Polygon)
```bash
npm run deploy:mainnet
```
Deploys the contract to Polygon mainnet.

**⚠️ Warning:** Only use for production deployment!

**Prerequisites:**
- Set `POLYGON_MAINNET_RPC_URL` in `.env` file
- Set `PRIVATE_KEY` in `.env` file
- Have mainnet MATIC for gas fees

### Run Tests
```bash
npm test
```
Runs Hardhat tests for the smart contract.

## Common Commands

### List all available scripts
```bash
npm run
```

### Check Hardhat version
```bash
npx hardhat --version
```

### Verify contract on Polygonscan
```bash
npx hardhat verify --network polygon-amoy <CONTRACT_ADDRESS>
```

## Troubleshooting

**Error: "Missing script: 'c'"**
- Use the full script name: `npm run compile` (not `npm run c`)

**Error: "Private key not set"**
- Create a `.env` file in the contracts directory
- Add: `PRIVATE_KEY=your_private_key_here`

**Error: "Insufficient funds"**
- Get testnet MATIC from: https://faucet.polygon.technology/
- Or add mainnet MATIC to your wallet


