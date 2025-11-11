# MongoDB Setup Guide

## The Error

You're seeing: `MongooseServerSelectionError: connect ECONNREFUSED`

This means MongoDB is not running or not accessible.

## Solution Options

### Option 1: Use MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

**No local installation needed!**

1. **Sign up for free MongoDB Atlas account**:
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free account (M0 cluster is free forever)

2. **Create a cluster**:
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider and region
   - Click "Create"

3. **Set up database access**:
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Atlas admin"

4. **Set up network access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address

5. **Get connection string**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

6. **Update backend/.env**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shiftaid?retryWrites=true&w=majority
   ```
   Replace `username`, `password`, and `cluster` with your actual values.

7. **Run seed again**:
   ```bash
   npm run seed
   ```

### Option 2: Install MongoDB Locally

#### Windows

1. **Download MongoDB**:
   - Go to https://www.mongodb.com/try/download/community
   - Download Windows installer
   - Run installer and follow setup wizard

2. **Start MongoDB Service**:
   ```powershell
   # MongoDB should start automatically as a Windows service
   # Check if it's running:
   Get-Service MongoDB
   
   # If not running, start it:
   Start-Service MongoDB
   ```

3. **Verify it's running**:
   - Default connection: `mongodb://localhost:27017`
   - Your `.env` should have: `MONGODB_URI=mongodb://localhost:27017/shiftaid`

4. **Run seed**:
   ```bash
   npm run seed
   ```

#### macOS

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 3: Use API-Based Seeding (No MongoDB Setup Needed)

If you don't want to set up MongoDB right now, use the API method:

1. **Start backend server** (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **In another terminal, seed via API**:
   ```bash
   cd backend
   npm run seed:api
   ```

   **Note**: This requires the backend to be running, but doesn't need MongoDB connection for the seed script itself (the backend handles the connection).

## Quick Test

After setting up MongoDB, test the connection:

```bash
# From backend directory
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shiftaid').then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

## Troubleshooting

### "Connection refused" error persists
- Check MongoDB is running: `mongosh` (should connect)
- Check firewall isn't blocking port 27017
- Verify connection string in `.env` is correct

### "Authentication failed"
- Check username/password in connection string
- Verify database user has correct permissions

### "Network access denied" (Atlas)
- Add your IP address in MongoDB Atlas Network Access
- Or temporarily allow access from anywhere (0.0.0.0/0)

## Recommended: MongoDB Atlas

For development, MongoDB Atlas is the easiest option:
- ✅ No local installation
- ✅ Free tier available
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Easy to share with team


