# SideShift API Setup Guide

## ✅ Your Credentials

Based on your information:
- **Private Key (Secret)**: `5ea464e287eed3de17606aa6c36fdae8`
- **Affiliate ID**: `YPmFmq7Kf`

## 📝 Update Your .env File

Update `backend/.env` with your SideShift credentials:

```env
SIDESHIFT_SECRET=5ea464e287eed3de17606aa6c36fdae8
AFFILIATE_ID=YPmFmq7Kf
SIDESHIFT_API_URL=https://sideshift.ai/api/v2
```

## 🔄 What I've Updated

### 1. API Base URL
- Changed from: `https://api.sideshift.ai/v2`
- Changed to: `https://sideshift.ai/api/v2`

### 2. Authentication Header
- Changed from: `x-api-key`
- Changed to: `x-sideshift-secret`

### 3. Environment Variables
- Changed from: `SIDESHIFT_API_KEY`
- Changed to: `SIDESHIFT_SECRET`
- Also supports: `AFFILIATE_ID` (instead of `SIDESHIFT_AFFILIATE_ID`)

### 4. API Endpoints
- **Quotes**: `POST /v2/quotes` (was `GET /quote`)
- **Create Shift**: `POST /v2/shifts/fixed` (was `POST /orders`)
- **Get Shift**: `GET /v2/shifts/{id}` (was `GET /orders/{id}`)

### 5. Request Format
- Now uses `depositCoin`, `depositNetwork`, `settleCoin`, `settleNetwork`
- Automatically parses formats like "USDC.polygon" → `{coin: "usdc", network: "polygon"}`

## 🧪 Test the Integration

### 1. Update .env File

Edit `backend/.env`:
```env
SIDESHIFT_SECRET=5ea464e287eed3de17606aa6c36fdae8
AFFILIATE_ID=YPmFmq7Kf
```

### 2. Restart Backend

```bash
cd backend
npm run dev
```

### 3. Test Quote Endpoint

```bash
curl http://localhost:3001/api/sideshift/quote?depositCoin=ETH&settleCoin=USDC.polygon&depositAmount=0.1
```

### 4. Test Creating a Donation

The donation flow will now:
1. Request a quote from SideShift
2. Create a fixed shift using the quote
3. Return the deposit address to the donor

## 📊 API Flow

### Old Flow (Incorrect):
```
GET /quote → POST /orders
```

### New Flow (Correct):
```
POST /v2/quotes → POST /v2/shifts/fixed → GET /v2/shifts/{id}
```

## 🔍 Coin Format Support

The code now automatically handles:
- `"BTC"` → `{coin: "btc", network: "bitcoin"}`
- `"ETH"` → `{coin: "eth", network: "mainnet"}`
- `"USDC.polygon"` → `{coin: "usdc", network: "polygon"}`
- `"USDC.arbitrum"` → `{coin: "usdc", network: "arbitrum"}`

## ⚠️ Important Notes

1. **Keep your secret safe**: Never commit `SIDESHIFT_SECRET` to git
2. **Affiliate ID**: Used to earn commissions on swaps
3. **Network names**: Must match SideShift's network names (lowercase)
4. **Quote expiration**: Quotes may expire, so shifts should be created soon after getting a quote

## ✅ Verification

After updating `.env`, test:

1. **Health check**: `curl http://localhost:3001/health`
2. **Get coins**: `curl http://localhost:3001/api/sideshift/coins`
3. **Get quote**: `curl "http://localhost:3001/api/sideshift/quote?depositCoin=ETH&settleCoin=USDC.polygon&depositAmount=0.1"`

If all work, your SideShift integration is configured correctly! 🎉

