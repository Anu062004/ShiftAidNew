# Vercel Deployment Setup Guide

## Issue: Quote API Fails on Vercel but Works Locally

### Root Cause
The frontend on Vercel needs the `NEXT_PUBLIC_API_URL` environment variable to point to your production backend.

### Solution

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your project (shift-aid-new-frontend)

2. **Set Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add the following variable:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://your-backend-url.onrender.com` (replace with your actual Render backend URL)
     - **Environment**: Production, Preview, and Development (select all)

3. **Redeploy**
   - After adding the environment variable, go to **Deployments**
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger a redeploy

### Verify Backend URL

1. Check your Render backend is running:
   - Go to https://render.com/dashboard
   - Find your backend service
   - Copy the service URL (e.g., `https://shiftaidnew.onrender.com`)

2. Test the backend health endpoint:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

3. Test the quote endpoint:
   ```
   https://your-backend-url.onrender.com/api/sideshift/quote?depositCoin=USDC.mainnet&settleCoin=USDC.polygon&depositAmount=1
   ```

### Common Issues

#### Issue 1: CORS Errors
**Symptom**: Browser console shows CORS errors

**Solution**: 
- In Render backend, set `FRONTEND_URL` environment variable to your Vercel URL:
  ```
  FRONTEND_URL=https://shift-aid-new-frontend.vercel.app
  ```
- Redeploy the backend

#### Issue 2: Network Error / ECONNREFUSED
**Symptom**: "Cannot connect to backend server" error

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that backend is running on Render
- Verify the backend URL is accessible (not behind a firewall)

#### Issue 3: Quote Fails with "Failed to fetch quote"
**Symptom**: Quote shows error but backend is accessible

**Possible Causes**:
1. **SideShift API Key not set**: Check Render backend has `SIDESHIFT_SECRET` or `SIDESHIFT_API_KEY`
2. **IP Address issue**: The backend should automatically handle IP extraction from Vercel's proxy headers
3. **Invalid coin pair**: Ensure both coins are supported by SideShift

**Solution**:
- Check Render backend logs for detailed error messages
- Verify SideShift API key is valid
- Test with a known good coin pair (e.g., BTC → USDC.polygon)

### Testing After Setup

1. Open your Vercel deployment: `https://shift-aid-new-frontend.vercel.app`
2. Go to the Donate page
3. Select an NGO
4. Choose a cryptocurrency (e.g., BTC, ETH)
5. Enter an amount
6. Check if the quote loads successfully

### Debugging Steps

1. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors when fetching quote

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Try to fetch a quote
   - Click on the `/api/sideshift/quote` request
   - Check:
     - Request URL (should point to your Render backend)
     - Response status
     - Response body (error details)

3. **Check Render Backend Logs**
   - Go to Render dashboard
   - Click on your backend service
   - Go to **Logs** tab
   - Look for errors when quote is requested

4. **Check Vercel Function Logs**
   - Go to Vercel dashboard
   - Click on your project
   - Go to **Functions** tab
   - Check for any errors

### Environment Variables Checklist

**Vercel (Frontend)**:
- [ ] `NEXT_PUBLIC_API_URL` = Your Render backend URL
- [ ] `NEXT_PUBLIC_POLYGON_RPC_URL` = Polygon RPC URL (optional)
- [ ] `NEXT_PUBLIC_CONTRACT_ADDRESS` = Your contract address (if using)

**Render (Backend)**:
- [ ] `SIDESHIFT_SECRET` or `SIDESHIFT_API_KEY` = Your SideShift API key
- [ ] `FRONTEND_URL` = Your Vercel frontend URL
- [ ] `USE_SUPABASE` = `true`
- [ ] `SUPABASE_URL` = Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE` = Your Supabase service role key
- [ ] `NODE_ENV` = `production`

### Quick Fix Script

If you want to quickly check your setup:

```bash
# Check if backend is accessible
curl https://your-backend-url.onrender.com/health

# Test quote endpoint
curl "https://your-backend-url.onrender.com/api/sideshift/quote?depositCoin=BTC&settleCoin=USDC.polygon&depositAmount=0.001"
```

### Still Not Working?

1. **Verify Backend is Running**
   - Check Render dashboard shows service as "Live"
   - Test health endpoint directly

2. **Check Environment Variables**
   - Verify all variables are set correctly
   - Check for typos in URLs
   - Ensure no trailing slashes

3. **Check CORS Configuration**
   - Backend should allow your Vercel domain
   - Check `FRONTEND_URL` matches exactly

4. **Review Backend Logs**
   - Look for specific error messages
   - Check SideShift API responses
   - Verify IP extraction is working

5. **Test Locally with Production Backend**
   - Set `NEXT_PUBLIC_API_URL` in local `.env.local` to production backend
   - Test if it works locally
   - This helps isolate frontend vs backend issues

---

**Note**: After setting environment variables in Vercel, you MUST redeploy for changes to take effect. Environment variables are baked into the build at build time.

