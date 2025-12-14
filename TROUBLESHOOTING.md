# ShiftAid Troubleshooting Guide

Common issues and their solutions.

## Backend Issues

### Port Already in Use

**Problem**: Backend fails to start with "Port 3005 already in use"

**Solution**:
```bash
# Windows
npm run kill-port

# Or manually
netstat -ano | findstr :3005
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3005 | xargs kill -9
```

### Database Connection Failed

**Problem**: "Supabase connection failed" or "Database error"

**Solutions**:
1. Verify `SUPABASE_URL` and `SUPABASE_DB_URL` in `.env`
2. Check Supabase project is active
3. Verify database schema is created:
   ```bash
   # Run schema in Supabase SQL Editor
   cat backend/supabase-schema.sql
   ```
4. Test connection:
   ```bash
   curl http://localhost:3005/health
   ```

### SideShift API Errors

**Problem**: "Failed to fetch quote" or "SideShift API error"

**Solutions**:
1. Verify `SIDESHIFT_API_KEY` is set correctly
2. Check API key is active at https://sideshift.ai/
3. Ensure x-user-ip header is being sent
4. Test with supported coin pairs (BTC, ETH, MATIC, USDC)
5. Check SideShift API status

**Common Error Messages**:
- "Invalid coin pair": Use format like "BTC" or "USDC.polygon"
- "Amount too low": Increase donation amount
- "Rate expired": Quote expired, fetch new quote

### CORS Errors

**Problem**: "CORS policy blocked" in browser console

**Solutions**:
1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. For local development, ensure frontend is on http://localhost:3000
3. Check backend CORS configuration in `server.js`
4. Clear browser cache and reload

## Frontend Issues

### Wallet Connection Failed

**Problem**: "Failed to connect wallet" or MetaMask not detected

**Solutions**:
1. Install MetaMask: https://metamask.io/download/
2. Unlock MetaMask
3. Refresh the page
4. Try different browser (Chrome, Firefox, Brave)
5. Check MetaMask is not blocked by browser extensions

### Wrong Network

**Problem**: "Please switch to Polygon network"

**Solutions**:
1. Open MetaMask
2. Click network dropdown
3. Select "Polygon Mainnet"
4. If not available, add manually:
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Currency Symbol: MATIC
   - Block Explorer: https://polygonscan.com

### NGOs Not Loading

**Problem**: "Error loading NGOs" or empty NGO list

**Solutions**:
1. Check backend is running: http://localhost:3005/health
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Seed database:
   ```bash
   npm run seed
   ```
4. Check browser console for errors
5. Test API directly:
   ```bash
   curl http://localhost:3005/api/ngos
   ```

### Quote Not Updating

**Problem**: Quote doesn't update when changing amount

**Solutions**:
1. Wait 500ms (debounce delay)
2. Check browser console for errors
3. Verify both coins are selected
4. Ensure amount is valid number
5. Check backend logs for SideShift errors

### Hydration Errors

**Problem**: "Hydration failed" or "Text content does not match"

**Solutions**:
1. Clear `.next` cache:
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```
2. Check for SSR issues in components
3. Ensure dynamic imports for wallet components

## Smart Contract Issues

### Deployment Failed

**Problem**: Contract deployment fails

**Solutions**:
1. Check wallet has sufficient MATIC:
   ```bash
   # Testnet faucet
   https://faucet.polygon.technology/
   ```
2. Verify `PRIVATE_KEY` in contracts `.env`
3. Check RPC URL is correct
4. Increase gas limit if needed
5. Try different RPC endpoint

### Contract Verification Failed

**Problem**: "Contract verification failed" on Polygonscan

**Solutions**:
1. Verify `POLYGONSCAN_API_KEY` is set
2. Wait 5-10 blocks after deployment
3. Manually verify:
   ```bash
   npx hardhat verify --network polygon <CONTRACT_ADDRESS>
   ```
4. Check compiler version matches (0.8.20)

## Development Issues

### Dependencies Won't Install

**Problem**: `npm install` fails

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check Node.js version (need 18+):
   ```bash
   node --version
   ```
4. Try with `--legacy-peer-deps`:
   ```bash
   npm install --legacy-peer-deps
   ```

### TypeScript Errors

**Problem**: TypeScript compilation errors

**Solutions**:
1. Restart TypeScript server in VS Code
2. Delete `.next` and `tsconfig.tsbuildinfo`
3. Run type check:
   ```bash
   cd frontend
   npm run build
   ```
4. Check for missing type definitions

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser

**Solutions**:
1. Restart dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check for syntax errors in console
4. Verify file is saved
5. Try different port if 3000 is blocked

## Production Issues

### Backend Not Responding (Render)

**Problem**: Backend returns 503 or times out

**Solutions**:
1. Check Render dashboard for errors
2. Verify all environment variables are set
3. Check logs in Render dashboard
4. Restart service
5. Verify database connection
6. Check if service is sleeping (free tier)

### Frontend Build Failed (Vercel)

**Problem**: Vercel deployment fails

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```
4. Check for TypeScript errors
5. Verify `NEXT_PUBLIC_*` variables are set

### Slow Response Times

**Problem**: API calls are very slow

**Solutions**:
1. Check backend logs for slow queries
2. Verify database indexes are created
3. Check SideShift API response times
4. Consider upgrading Render instance
5. Add caching for frequently accessed data
6. Use CDN for static assets

### Database Connection Pool Exhausted

**Problem**: "Too many connections" error

**Solutions**:
1. Check for connection leaks in code
2. Increase connection pool size in Supabase
3. Implement connection pooling
4. Close connections properly
5. Restart backend service

## Testing Issues

### Test Donations Not Completing

**Problem**: Donation stuck in "pending" status

**Solutions**:
1. Check SideShift order status:
   ```bash
   curl https://sideshift.ai/api/v2/shifts/<ORDER_ID>
   ```
2. Verify deposit was sent to correct address
3. Check deposit amount meets minimum
4. Wait for blockchain confirmations
5. Check SideShift webhook is configured

### Webhook Not Receiving Updates

**Problem**: Donation status not updating automatically

**Solutions**:
1. Verify `WEBHOOK_SECRET` is set
2. Check webhook URL is accessible
3. Test webhook endpoint:
   ```bash
   curl -X POST http://localhost:3005/api/webhooks/sideshift \
     -H "Content-Type: application/json" \
     -d '{"orderId":"test","status":"completed"}'
   ```
4. Check SideShift webhook configuration
5. Review webhook logs

## Performance Issues

### Slow Page Load

**Problem**: Pages take long to load

**Solutions**:
1. Check network tab in browser DevTools
2. Optimize images and assets
3. Enable caching
4. Use lazy loading for components
5. Minimize API calls
6. Check backend response times

### High Memory Usage

**Problem**: Application uses too much memory

**Solutions**:
1. Check for memory leaks
2. Optimize database queries
3. Implement pagination
4. Clear unused connections
5. Restart services periodically

## Security Issues

### Private Key Exposed

**Problem**: Private key accidentally committed to Git

**Solutions**:
1. **IMMEDIATELY** rotate the key
2. Transfer funds to new wallet
3. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
4. Force push (if safe to do so)
5. Update all deployments with new key

### Suspicious Activity Detected

**Problem**: Unusual donation patterns or transactions

**Solutions**:
1. Review recent donations in database
2. Check transaction hashes on blockchain
3. Verify NGO wallet addresses
4. Implement rate limiting
5. Add monitoring and alerts
6. Contact SideShift support if needed

## Getting Help

If you can't resolve an issue:

1. **Check Logs**:
   - Backend: Render dashboard logs
   - Frontend: Browser console
   - Blockchain: Polygonscan

2. **Search Documentation**:
   - README.md
   - DEPLOYMENT.md
   - This file

3. **Test Endpoints**:
   ```bash
   # Health check
   curl http://localhost:3005/health
   
   # NGOs
   curl http://localhost:3005/api/ngos
   
   # Coins
   curl http://localhost:3005/api/sideshift/coins
   ```

4. **Check Status Pages**:
   - Render: https://status.render.com/
   - Vercel: https://www.vercel-status.com/
   - Supabase: https://status.supabase.com/
   - SideShift: Check their API status

5. **Open an Issue**:
   - Provide error messages
   - Include relevant logs
   - Describe steps to reproduce
   - Mention your environment (OS, Node version, etc.)

## Common Error Codes

- **400 Bad Request**: Invalid input, check request parameters
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error, check logs
- **502 Bad Gateway**: Backend not responding
- **503 Service Unavailable**: Service is down or restarting

---

**Still stuck?** Open an issue on GitHub with:
- Error message
- Steps to reproduce
- Environment details
- Relevant logs
