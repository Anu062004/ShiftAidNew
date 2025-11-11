# Fixing SideShift API 400 Error

## The Error

```
Error: Failed to fetch quote: Request failed with status code 400
```

A 400 Bad Request means the API request format is incorrect.

## ✅ What I've Fixed

1. **Improved Error Logging**: Now shows detailed error information
2. **Better Coin Parsing**: Handles edge cases and validates input
3. **Amount Formatting**: Ensures amounts are strings
4. **Debug Logging**: Shows request payload for troubleshooting

## 🔍 Common Causes of 400 Error

### 1. Invalid Coin/Network Format
- **Wrong**: `"ETH"` without network
- **Right**: `"eth"` with `"mainnet"` network
- **Right**: `"USDC.polygon"` → `{coin: "usdc", network: "polygon"}`

### 2. Missing Required Fields
- Must have: `depositCoin`, `depositNetwork`, `settleCoin`, `settleNetwork`
- Must have: Either `depositAmount` OR `settleAmount`

### 3. Invalid Amount Format
- Must be a string (not number)
- Must be valid decimal format

### 4. Invalid Network Name
- Must match SideShift's network names exactly
- Common: `"mainnet"`, `"polygon"`, `"arbitrum"`, `"bitcoin"`

## 🧪 Test the Fix

Restart your backend and try again:

```bash
cd backend
npm run dev
```

Then test the quote endpoint:
```bash
curl "http://localhost:3001/api/sideshift/quote?depositCoin=ETH&settleCoin=USDC.polygon&depositAmount=0.1"
```

## 📋 Check Backend Logs

After restarting, you should see:
- ✅ SideShift Secret configured
- ✅ SideShift Affiliate ID: YPmFmq7Kf
- SideShift Quote Request: { ... }

If you see an error, check:
1. The request payload format
2. The error response from SideShift
3. Whether all required fields are present

## 🔧 Manual Test

You can test directly with curl:

```bash
curl -L 'https://sideshift.ai/api/v2/quotes' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: 5ea464e287eed3de17606aa6c36fdae8' \
-d '{
  "depositCoin": "eth",
  "depositNetwork": "mainnet",
  "settleCoin": "usdc",
  "settleNetwork": "polygon",
  "depositAmount": "0.1",
  "affiliateId": "YPmFmq7Kf"
}'
```

If this works, the issue is in our code. If it fails, check:
- Is the secret correct?
- Are the coin/network names correct?
- Is the format exactly as shown?

## 📝 Next Steps

1. Restart backend: `npm run dev` (in backend directory)
2. Check the console logs for detailed error info
3. Try the quote endpoint again
4. Share the detailed error message if it still fails

The improved error logging will show exactly what SideShift is rejecting.

