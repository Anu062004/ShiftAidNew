# Fix: Deployment Error

## The Error

```
Error: factory runner does not support sending transactions
```

This happens when:
1. Private key is not set in `.env`
2. Private key format is incorrect
3. Network configuration is missing

## ✅ Solution

### Step 1: Create/Update `contracts/.env`

Create `contracts/.env` file:

```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

**Important:**
- Private key should NOT have `0x` prefix
- Use a wallet with testnet MATIC
- Never commit this file to git

### Step 2: Get Testnet MATIC

1. Go to: https://faucet.polygon.technology/
2. Enter your wallet address
3. Request testnet MATIC
4. Wait for confirmation

### Step 3: Deploy Again

```bash
npm run deploy:amoy
```

## 🔍 Verify Your Setup

### Check if .env exists:
```bash
# Windows
type contracts\.env

# Mac/Linux
cat contracts/.env
```

### Check if private key is set:
```bash
# Should show your private key (without 0x)
```

### Check wallet balance:
```bash
# Visit Polygonscan Amoy and search your wallet address
# Or use: https://amoy.polygonscan.com/
```

## 📝 Example .env File

```env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Note:** Replace with your actual private key (no 0x prefix)

## 🚀 After Successful Deployment

You'll see:
```
✅ DonationRouter deployed to: 0x1234...
📝 Save this address in your .env file as CONTRACT_ADDRESS
```

Then add to:
- `backend/.env`: `CONTRACT_ADDRESS=0x...`
- `frontend/.env.local`: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`

## ⚠️ Common Issues

### "Insufficient funds"
- Get testnet MATIC from faucet
- Make sure you're using the correct network

### "Invalid private key"
- Remove `0x` prefix if present
- Check for extra spaces
- Ensure it's 64 characters (hex)

### "Network not found"
- Check `hardhat.config.js` has `polygon-amoy` network
- Verify RPC URL is correct

