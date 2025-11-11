# 🚀 Quick Fix: MongoDB Error

## The Error
```
MongooseServerSelectionError: connect ECONNREFUSED
```
**MongoDB is not running or not configured.**

## ✅ Easiest Solution (Recommended)

### Use MongoDB Atlas (Cloud - Free)

**Takes 5 minutes, no installation needed!**

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create free cluster**: Choose "M0 FREE"
3. **Create database user**: Username + Password
4. **Allow network access**: Click "Allow Access from Anywhere"
5. **Get connection string**: Database → Connect → "Connect your application"
6. **Update `backend/.env`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shiftaid?retryWrites=true&w=majority
   ```
   Replace `username`, `password`, and `cluster0.xxxxx` with your values.

7. **Run seed**:
   ```bash
   npm run seed
   ```

## 📝 I've Created backend/.env for You

I've created a `.env` file in the backend directory. You need to:

1. **If using MongoDB Atlas (cloud)**:
   - Update `MONGODB_URI` with your Atlas connection string

2. **If using local MongoDB**:
   - Make sure MongoDB is installed and running
   - The default `MONGODB_URI=mongodb://localhost:27017/shiftaid` should work

## 🔍 Check MongoDB Status

### Windows (if installed locally):
```powershell
Get-Service MongoDB
```

If not running:
```powershell
Start-Service MongoDB
```

### Test Connection:
```bash
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

## 🎯 Next Steps

1. Choose MongoDB Atlas (cloud) OR install MongoDB locally
2. Update `backend/.env` with correct `MONGODB_URI`
3. Run: `npm run seed`
4. Check your donation page - NGOs should appear!

## 💡 Tip

**MongoDB Atlas is recommended** because:
- ✅ Free forever (M0 tier)
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Easy to set up

Need help? Check `QUICK_FIX_MONGODB.md` for detailed steps.


