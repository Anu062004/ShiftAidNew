# 🚀 Start Your Backend - Quick Guide

## ✅ Status Check

- ✅ MongoDB is **RUNNING**
- ✅ Dependencies are **INSTALLED**
- ✅ Backend code is **READY**

## 📝 Step 1: Create .env File

Create `backend/.env` file with this content:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shiftaid
SIDESHIFT_API_KEY=your_sideshift_api_key_here
SIDESHIFT_API_URL=https://api.sideshift.ai/v2
NODE_ENV=development
```

**Minimum to get started:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shiftaid
```

## 🎯 Step 2: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 3001
```

## 🧪 Step 3: Test It

Open browser: http://localhost:3001/health

Or use curl:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## 🌱 Step 4: Seed NGOs

In a **new terminal**:
```bash
cd backend
npm run seed
```

This will create 12 mock NGOs!

## ✅ Done!

Your backend is now running and ready to use!

## 🔗 Next Steps

1. Start frontend: `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Test the donation flow!

