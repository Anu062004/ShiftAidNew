# ShiftAid API Documentation

## Base URL

Development: `http://localhost:3001`  
Production: `https://your-backend-domain.com`

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### NGOs

#### Get All NGOs

**GET** `/api/ngos`

**Query Parameters:**
- `category` (optional): Filter by category
- `verified` (optional): Filter by verification status (true/false)
- `search` (optional): Search in name and description

**Response:**
```json
[
  {
    "_id": "...",
    "name": "Education for All Foundation",
    "description": "...",
    "category": "Education",
    "walletAddress": "0x...",
    "preferredCoin": "USDC.polygon",
    "verified": true,
    "totalDonations": 1000,
    "donationCount": 5
  }
]
```

#### Get NGO by ID

**GET** `/api/ngos/:id`

**Response:**
```json
{
  "_id": "...",
  "name": "...",
  ...
}
```

#### Create NGO

**POST** `/api/ngos`

**Body:**
```json
{
  "name": "NGO Name",
  "description": "Description",
  "category": "Education",
  "walletAddress": "0x...",
  "preferredCoin": "USDC.polygon",
  "website": "https://example.org"
}
```

### SideShift Integration

#### Get Supported Coins

**GET** `/api/sideshift/coins`

Returns all cryptocurrencies supported by SideShift.

**Response:**
```json
[
  {
    "id": "BTC",
    "name": "Bitcoin",
    "network": "bitcoin"
  },
  ...
]
```

#### Get Quote

**GET** `/api/sideshift/quote`

**Query Parameters:**
- `depositCoin` (required): Coin to deposit (e.g., "BTC")
- `settleCoin` (required): Coin to receive (e.g., "USDC.polygon")
- `depositAmount` (optional): Amount to deposit
- `settleAmount` (optional): Amount to receive

**Response:**
```json
{
  "depositCoin": "BTC",
  "settleCoin": "USDC.polygon",
  "depositAmount": "0.01",
  "settleAmount": "450.50",
  "rate": "45050",
  "fees": "2.25"
}
```

### Donations

#### Create Donation Order

**POST** `/api/donations`

**Body:**
```json
{
  "ngoId": "ngo_id_here",
  "depositCoin": "BTC",
  "settleCoin": "USDC.polygon",
  "donorAddress": "0x...",
  "depositAmount": "0.01"
}
```

**Response:**
```json
{
  "donation": {
    "_id": "...",
    "donorAddress": "0x...",
    "ngoId": "...",
    "sideshiftOrderId": "order_id",
    "depositCoin": "BTC",
    "settleCoin": "USDC.polygon",
    "depositAmount": "0.01",
    "settleAmount": "450.50",
    "depositAddress": "bc1...",
    "status": "pending"
  },
  "sideshiftOrder": {
    "id": "order_id",
    "depositAddress": "bc1...",
    "depositCoin": "BTC",
    "settleCoin": "USDC.polygon",
    "depositAmount": "0.01",
    "settleAmount": "450.50"
  }
}
```

#### Get Donation by ID

**GET** `/api/donations/:id`

**Response:**
```json
{
  "_id": "...",
  "donorAddress": "0x...",
  "ngoId": {...},
  "sideshiftOrderId": "...",
  "status": "completed",
  "depositTxHash": "...",
  "settleTxHash": "...",
  "onChainTxHash": "..."
}
```

#### Get Donations

**GET** `/api/donations`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status

**Response:**
```json
{
  "donations": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get Donations by Donor

**GET** `/api/donations/donor/:address`

**Response:**
```json
[
  {
    "_id": "...",
    "donorAddress": "0x...",
    ...
  }
]
```

### Dashboard

#### Get Dashboard Stats

**GET** `/api/dashboard/stats`

**Response:**
```json
{
  "totalDonations": 150,
  "totalAmount": 50000,
  "topDonors": [
    {
      "_id": "0x...",
      "totalDonated": 5000,
      "donationCount": 10
    }
  ],
  "topNGOs": [
    {
      "_id": "...",
      "totalReceived": 10000,
      "donationCount": 25,
      "ngo": {...}
    }
  ],
  "recentDonations": [...],
  "weeklyStats": {
    "donations": 20,
    "amount": 5000
  }
}
```

#### Get Leaderboard

**GET** `/api/dashboard/leaderboard`

**Query Parameters:**
- `type` (optional): "donors" or "ngos" (default: "donors")
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
[
  {
    "_id": "0x...",
    "totalDonated": 5000,
    "donationCount": 10
  }
]
```

### Webhooks

#### SideShift Webhook

**POST** `/api/webhooks/sideshift`

This endpoint receives webhook notifications from SideShift when order status changes.

**Headers:**
- `x-sideshift-signature`: Webhook signature (if configured)

**Body:**
```json
{
  "type": "order.updated",
  "data": {
    "id": "order_id",
    "status": "completed",
    "depositTxHash": "...",
    "settleTxHash": "..."
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "errors": [
    {
      "msg": "Validation error",
      "param": "field",
      "location": "body"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

Currently, the API does not require authentication for most endpoints. In production, consider adding:

- API key authentication for admin endpoints
- JWT tokens for user-specific operations
- Rate limiting

## Rate Limiting

Consider implementing rate limiting in production to prevent abuse.

## CORS

The API is configured to accept requests from:
- `http://localhost:3000` (development)
- Your production frontend domain

Update CORS settings in `backend/src/server.js` for production.


