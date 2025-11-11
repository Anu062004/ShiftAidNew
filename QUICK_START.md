# 🚀 Quick Start - Single Command

## Start Everything

### Windows:
```bash
npm start
```

Or double-click: `start.bat`

### Mac/Linux:
```bash
npm start
```

Or run: `bash start.sh`

## What It Does

This single command will:
1. ✅ Start the **Backend** server (port 3001)
2. ✅ Start the **Frontend** server (port 3000)
3. ✅ Show colored output for each service
4. ✅ Run both services concurrently

## First Time Setup

If it's your first time, run:

```bash
npm run setup
```

This will:
1. Install all dependencies (root, frontend, backend, contracts)
2. Seed the database with mock NGOs

## Access Your App

After running `npm start`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Stop Services

Press `Ctrl+C` to stop all services.

## Other Commands

```bash
# Install all dependencies
npm run install:all

# Seed database with NGOs
npm run seed

# Build for production
npm run build

# Compile smart contracts
npm run compile
```

## Troubleshooting

### Port Already in Use
- Change ports in `backend/.env` (PORT) and `frontend/.env.local` (if needed)

### MongoDB Not Running
- Make sure MongoDB is running
- Or use MongoDB Atlas (cloud)

### Dependencies Missing
- Run: `npm run install:all`

---

**That's it!** Just run `npm start` and everything will work! 🎉

