# Fix: Port 3001 Already in Use

## The Error

```
Error: listen EADDRINUSE: address already in use :::3001
```

This means another process is already using port 3001.

## ✅ Quick Fix

### Option 1: Kill the Process (Recommended)

**Windows:**
```powershell
# Find the process
netstat -ano | findstr :3001

# Kill it (replace PID with the number from above)
taskkill /F /PID <PID>
```

**Mac/Linux:**
```bash
# Find the process
lsof -ti:3001

# Kill it
kill -9 $(lsof -ti:3001)
```

### Option 2: Change the Port

Edit `backend/.env`:
```env
PORT=3002
```

Then update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 🔍 Find What's Using Port 3001

**Windows:**
```powershell
netstat -ano | findstr :3001
```

**Mac/Linux:**
```bash
lsof -i :3001
```

## 🚀 After Fixing

1. **Kill the old process** (if using Option 1)
2. **Restart your servers:**
   ```bash
   npm start
   ```

## 💡 Prevention

I've updated the server to show helpful error messages when this happens again. The server will now:
- Show which port is in use
- Provide instructions on how to fix it
- Suggest changing the port if needed

## ✅ I've Already Fixed It

I've killed the process (PID 16056) that was using port 3001. You can now restart:

```bash
npm start
```

The backend should start successfully now!


