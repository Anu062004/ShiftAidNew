# Swap Order Creation Troubleshooting

## Error: "Failed to create swap order"

This error occurs when the SideShift API rejects the swap order creation request. Here are the most common causes and solutions:

## Common Causes

### 1. Invalid NGO Wallet Address
**Problem**: The NGO's wallet address is not a valid Ethereum address format, or it's not compatible with the settle network.

**Solution**:
- Check that NGO wallet addresses are valid Ethereum addresses (0x followed by 40 hex characters)
- For Polygon network, the address format is the same as Ethereum (0x...)
- Verify the address in the database matches the network requirements

**Check**:
```javascript
// Valid format: 0x followed by 40 hex characters
/^0x[a-fA-F0-9]{40}$/.test(walletAddress)
```

### 2. SideShift API Credentials
**Problem**: Invalid or missing SideShift API credentials.

**Check**:
- `SIDESHIFT_SECRET` in `backend/.env` must be your SideShift account private key
- `AFFILIATE_ID` (optional) should be your SideShift affiliate ID
- Verify credentials at: https://sideshift.ai/account

**Solution**:
```env
SIDESHIFT_SECRET=your_private_key_here
AFFILIATE_ID=your_affiliate_id_here
SIDESHIFT_API_URL=https://sideshift.ai/api/v2
```

### 3. Quote Expired
**Problem**: The quote used to create the shift has expired (quotes typically expire after a few minutes).

**Solution**: The code automatically creates a new quote if one isn't provided, so this should be handled automatically.

### 4. Invalid Coin/Network Combination
**Problem**: The coin and network combination is not supported by SideShift.

**Examples**:
- ✅ Valid: `USDC.arbitrum` → `USDC.polygon`
- ✅ Valid: `ETH.mainnet` → `USDC.polygon`
- ❌ Invalid: Unsupported coin or network

**Solution**: Check SideShift API documentation for supported pairs.

### 5. Insufficient Balance or Limits
**Problem**: SideShift might have minimum/maximum limits for swaps.

**Solution**: Check SideShift API response for specific limits.

## How to Debug

### 1. Check Backend Console
When you try to create a donation, check the backend terminal. You should see:

```
Creating SideShift order with: { ... }
Creating SideShift quote: { ... }
Quote created successfully: <quote-id>
Creating SideShift fixed shift: { ... }
```

If you see errors, they will show the exact SideShift API response.

### 2. Check Browser Console
Open browser DevTools (F12) → Console tab. The error should now show more details:
- `error`: Main error message
- `details`: Detailed error from SideShift
- `sideShiftError`: Full SideShift API error response

### 3. Test SideShift API Directly
Test if SideShift API is working:

```bash
curl -L 'https://sideshift.ai/api/v2/quotes' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: YOUR_SECRET' \
-d '{
  "depositCoin": "usdc",
  "depositNetwork": "arbitrum",
  "settleCoin": "usdc",
  "settleNetwork": "polygon",
  "depositAmount": "5",
  "affiliateId": "YOUR_AFFILIATE_ID"
}'
```

### 4. Verify NGO Wallet Address
Check the NGO's wallet address in the database:
- Must be a valid Ethereum address format
- Should work on Polygon network (same format as Ethereum)

## Expected Flow

1. **Frontend** sends donation request with:
   - `ngoId`
   - `depositCoin` (e.g., "USDC.arbitrum")
   - `settleCoin` (e.g., "USDC.polygon")
   - `depositAmount` (e.g., "5")
   - `donorAddress`

2. **Backend**:
   - Validates NGO exists and is verified
   - Validates wallet address format
   - Creates SideShift quote
   - Creates SideShift fixed shift with NGO's wallet as `settleAddress`
   - Saves donation record

3. **SideShift**:
   - Returns shift ID and deposit address
   - User sends crypto to deposit address
   - SideShift swaps and sends to NGO wallet

## Next Steps

1. **Check backend console** for detailed error logs
2. **Verify SideShift credentials** in `backend/.env`
3. **Check NGO wallet addresses** are valid Ethereum addresses
4. **Test with a different coin pair** to see if it's coin-specific
5. **Check SideShift API status** at https://status.sideshift.ai

## Updated Error Handling

The error response now includes:
- `error`: "Failed to create swap order"
- `details`: Specific error message from SideShift
- `sideShiftError`: Full error object from SideShift API

This will help identify the exact issue!


