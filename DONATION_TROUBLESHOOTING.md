# Donation Creation Troubleshooting

## Common Issues and Solutions

### 1. "Failed to create swap order"

**Possible Causes:**
- SideShift API credentials not set correctly
- Invalid coin/network combination
- Missing required fields
- SideShift API is down

**Solutions:**
1. Check `backend/.env` has:
   ```env
   SIDESHIFT_SECRET=5ea464e287eed3de17606aa6c36fdae8
   AFFILIATE_ID=YPmFmq7Kf
   SIDESHIFT_API_URL=https://sideshift.ai/api/v2
   ```

2. Check backend console for detailed error messages

3. Verify the coin/network combination is supported by SideShift

### 2. "NGO is not verified"

**Solution:**
- Make sure the NGO you selected is verified
- Check `backend/.env` and run seed if needed:
  ```bash
  npm run seed
  ```

### 3. "Invalid donor address"

**Solution:**
- Make sure your wallet is connected
- The address must be a valid Ethereum address format

### 4. "Either depositAmount or settleAmount is required"

**Solution:**
- Make sure you entered an amount in the "Amount to Donate" field
- The amount must be greater than 0

### 5. SideShift API 400 Error

**Check:**
1. Backend console for detailed error
2. SideShift API credentials are correct
3. Coin/network format matches SideShift requirements

**Common fixes:**
- Ensure amounts are strings (not numbers)
- Verify coin names are lowercase
- Check network names match SideShift format

## 🔍 Debug Steps

### Step 1: Check Backend Logs

When you try to create a donation, check the backend console. You should see:
```
Creating SideShift order with: { ... }
Creating SideShift quote: { ... }
Quote created successfully: <quote-id>
Creating SideShift fixed shift: { ... }
Fixed shift created successfully: <shift-id>
```

If you see errors, they will show what's wrong.

### Step 2: Test SideShift API Directly

Test if SideShift API is working:

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

If this fails, the issue is with SideShift API credentials or the request format.

### Step 3: Check Frontend Console

Open browser DevTools (F12) and check:
- Network tab: See the API request/response
- Console tab: See any JavaScript errors

### Step 4: Verify Environment Variables

Make sure all required env vars are set in `backend/.env`:
- `SIDESHIFT_SECRET`
- `AFFILIATE_ID`
- `MONGODB_URI`
- `CONTRACT_ADDRESS` (optional for now)

## ✅ What I've Fixed

1. **Better Error Messages**: Frontend now shows detailed error messages
2. **Improved Logging**: Backend logs each step of the donation creation
3. **Validation**: Added checks for required fields
4. **Error Display**: Errors now show in the UI, not just alerts

## 🧪 Test the Fix

1. **Restart backend** (if running):
   ```bash
   cd backend
   npm run dev
   ```

2. **Try creating a donation**:
   - Connect wallet
   - Select NGO
   - Choose crypto (e.g., ETH)
   - Enter amount (e.g., 0.1)
   - Click "Create Donation Order"

3. **Check the console**:
   - Backend: Should show detailed logs
   - Frontend: Should show any errors clearly

## 📝 Still Having Issues?

Share:
1. The exact error message you see
2. Backend console output
3. Browser console errors
4. What you tried to donate (coin, amount, NGO)

This will help identify the specific issue!


