# Seeding Mock NGOs

This guide explains how to add mock NGOs to your database for testing.

## Method 1: Direct Database Seeding (Recommended)

This method requires MongoDB to be running.

### Prerequisites
- MongoDB running locally or MongoDB Atlas connection string
- Backend `.env` file configured with `MONGODB_URI`

### Steps

1. **Start MongoDB** (if using local):
   ```bash
   # Windows (if installed as service, it should auto-start)
   # Or use MongoDB Atlas (cloud) - no local setup needed
   ```

2. **Configure MongoDB URI** in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/shiftaid
   # OR for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shiftaid
   ```

3. **Run the seed script**:
   ```bash
   # From root directory
   npm run seed

   # OR from backend directory
   cd backend
   npm run seed
   ```

## Method 2: Via API (Alternative)

Use this method if MongoDB connection is not available or you prefer API-based seeding.

### Prerequisites
- Backend server must be running

### Steps

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **In a new terminal, run the API seed script**:
   ```bash
   cd backend
   npm run seed:api
   ```

## Mock NGOs Included

The seed script includes **12 diverse NGOs** across different categories:

### Education
- **Education for All Foundation** - Building schools and training teachers
- **Tech for Good Foundation** - Digital literacy and tech education

### Healthcare
- **Global Health Initiative** - Medical supplies and mobile clinics
- **Clean Water Initiative** - Clean water access
- **Mental Health Alliance** - Mental health services

### Environment
- **Climate Action Network** - Reforestation and renewable energy
- **Wildlife Conservation Society** - Endangered species protection

### Poverty
- **Poverty Relief Organization** - Food programs and job training
- **Rural Development Fund** - Agricultural training and infrastructure

### Disaster Relief
- **Disaster Response Team** - Emergency response and recovery

### Human Rights
- **Human Rights Watch** - Human rights advocacy
- **Refugee Support Network** - Refugee services

## Verifying NGOs

After seeding, you can verify NGOs are created:

1. **Via API**:
   ```bash
   curl http://localhost:3001/api/ngos
   ```

2. **Via Frontend**:
   - Open http://localhost:3000/ngos
   - You should see all 12 NGOs listed

3. **Check Dashboard**:
   - Open http://localhost:3000/dashboard
   - NGOs should appear in the top NGOs section

## Troubleshooting

### Error: "connect ECONNREFUSED"
**Solution**: MongoDB is not running. Either:
- Start local MongoDB
- Use MongoDB Atlas (cloud)
- Use Method 2 (API seeding) instead

### Error: "NGO with this wallet address already exists"
**Solution**: The NGO already exists. The seed script will skip it automatically.

### NGOs not showing in frontend
**Solution**: 
- Make sure backend is running
- Check that NGOs are verified (seed script auto-verifies them)
- Refresh the frontend page

## Adding More NGOs

To add more NGOs, edit `backend/src/scripts/seed.js` and add to the `sampleNGOs` array:

```javascript
{
  name: 'Your NGO Name',
  description: 'Description here',
  category: 'Education', // or Healthcare, Environment, etc.
  walletAddress: '0x...', // Valid Ethereum address
  preferredCoin: 'USDC.polygon',
  website: 'https://example.org',
  verified: true,
}
```

Then run the seed script again.


