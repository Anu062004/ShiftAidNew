# SideShift API Use Case in ShiftAid

## 🎯 Core Purpose

**SideShift API is the engine that enables cross-chain cryptocurrency donations.**

It solves the critical problem: **How do you let someone donate Bitcoin, while the NGO receives USDC on Polygon?**

## 🔄 The Problem It Solves

### Without SideShift API:
- ❌ Donor has Bitcoin, NGO wants USDC on Polygon
- ❌ Donor must manually swap on multiple exchanges
- ❌ NGO must manage wallets on multiple chains
- ❌ Complex, slow, and error-prone process
- ❌ High fees from multiple transactions

### With SideShift API:
- ✅ Donor sends Bitcoin directly
- ✅ SideShift automatically converts to USDC on Polygon
- ✅ NGO receives stablecoin instantly
- ✅ Single transaction, low fees
- ✅ Fully automated and transparent

## 🛠️ How SideShift API is Used

### 1. **Fetching Supported Cryptocurrencies** (`GET /coins`)

**Use Case:** Show donors what cryptocurrencies they can donate

**Implementation:**
```javascript
// backend/src/config/sideshift.js
export const getCoins = async () => {
  const response = await sideshiftApi.get('/coins');
  return response.data; // Returns all supported coins
};
```

**Flow:**
1. User opens donation page
2. Frontend calls: `GET /api/sideshift/coins`
3. Backend calls SideShift API: `GET /coins`
4. Returns list of 200+ supported cryptocurrencies
5. User sees dropdown: Bitcoin, Ethereum, MATIC, USDC, etc.

**Why it matters:** Donors can donate from ANY supported blockchain without the platform needing to support each one.

---

### 2. **Getting Real-Time Quotes** (`GET /quote`)

**Use Case:** Show donors exactly how much the NGO will receive before they donate

**Implementation:**
```javascript
export const getQuote = async (depositCoin, settleCoin, depositAmount) => {
  const response = await sideshiftApi.get('/quote', {
    params: { depositCoin, settleCoin, depositAmount }
  });
  return response.data; // Returns conversion rate and fees
};
```

**Flow:**
1. User selects: "Donate 0.01 BTC to Education NGO"
2. NGO prefers: "USDC on Polygon"
3. Frontend calls: `GET /api/sideshift/quote?depositCoin=BTC&settleCoin=USDC.polygon&depositAmount=0.01`
4. Backend calls SideShift API
5. Returns: "0.01 BTC = 450 USDC (after fees)"
6. User sees quote and can confirm

**Why it matters:** Transparency - donors know exactly what the NGO receives before committing.

---

### 3. **Creating Swap Orders** (`POST /orders`)

**Use Case:** Create the actual cross-chain swap that converts donor's crypto to NGO's stablecoin

**Implementation:**
```javascript
export const createOrder = async (orderData) => {
  const payload = {
    depositCoin: 'BTC',
    settleCoin: 'USDC.polygon',
    settleAddress: ngo.walletAddress, // NGO's wallet
    depositAmount: '0.01'
  };
  const response = await sideshiftApi.post('/orders', payload);
  return response.data; // Returns order ID and deposit address
};
```

**Flow:**
1. User confirms donation
2. Backend creates SideShift order with:
   - What donor is sending: `BTC`
   - What NGO receives: `USDC.polygon`
   - NGO's wallet address: `0x...`
   - Amount: `0.01 BTC`
3. SideShift returns:
   - Order ID: `abc123`
   - Deposit address: `bc1...` (where donor sends BTC)
4. Donor sends BTC to that address
5. SideShift automatically:
   - Receives BTC
   - Swaps it to USDC
   - Sends USDC to NGO's Polygon wallet

**Why it matters:** This is the core magic - automatic cross-chain conversion without manual steps.

---

### 4. **Tracking Order Status** (`GET /orders/{id}`)

**Use Case:** Monitor donation progress in real-time

**Implementation:**
```javascript
export const getOrder = async (orderId) => {
  const response = await sideshiftApi.get(`/orders/${orderId}`);
  return response.data; // Returns current status
};
```

**Flow:**
1. Donation page shows status: "Pending Deposit"
2. Backend periodically checks: `GET /orders/abc123`
3. SideShift returns status:
   - `waiting_deposit` → "Waiting for your payment"
   - `deposit_received` → "Payment received, swapping..."
   - `swapping` → "Converting to USDC..."
   - `completed` → "✅ Donation complete! NGO received USDC"
4. Dashboard updates automatically

**Why it matters:** Real-time transparency - everyone can see donation progress.

---

### 5. **Webhook Integration** (`POST /api/webhooks/sideshift`)

**Use Case:** Get instant notifications when donations complete

**Implementation:**
```javascript
// backend/src/routes/webhooks.js
router.post('/sideshift', async (req, res) => {
  const event = req.body;
  if (event.type === 'order.completed') {
    // Update donation status
    // Log on-chain
    // Update NGO stats
  }
});
```

**Flow:**
1. Donor sends crypto to SideShift deposit address
2. SideShift completes swap
3. SideShift sends webhook to: `POST /api/webhooks/sideshift`
4. Backend receives notification
5. Backend:
   - Updates donation status to "completed"
   - Logs transaction on-chain
   - Updates NGO total donations
   - Updates dashboard

**Why it matters:** Instant updates without polling - better UX and real-time accuracy.

---

## 💡 Real-World Example

### Scenario: Alice wants to donate Bitcoin to a charity

**Without SideShift:**
1. Alice has 0.01 BTC
2. Charity wants USDC on Polygon
3. Alice must:
   - Send BTC to exchange
   - Swap BTC → USDC
   - Bridge USDC to Polygon
   - Send to charity
4. Takes 30+ minutes, multiple fees, complex

**With SideShift (in ShiftAid):**
1. Alice selects charity and enters: "0.01 BTC"
2. ShiftAid shows: "Charity will receive 450 USDC"
3. Alice confirms
4. ShiftAid creates SideShift order
5. Alice sends BTC to SideShift address
6. **SideShift automatically:**
   - Receives BTC
   - Converts to USDC
   - Sends USDC to charity's Polygon wallet
7. Takes 5 minutes, single fee, fully automated

---

## 🎯 Key Benefits

### For Donors:
- ✅ Donate with ANY cryptocurrency
- ✅ See exact conversion rate before donating
- ✅ Simple, one-step process
- ✅ Transparent transaction tracking

### For NGOs:
- ✅ Receive funds in preferred stablecoin
- ✅ No need to manage multiple wallets
- ✅ No manual swapping required
- ✅ Instant receipt of funds

### For the Platform:
- ✅ Support 200+ cryptocurrencies without infrastructure
- ✅ No need to handle swaps manually
- ✅ Real-time status updates via webhooks
- ✅ Earn affiliate fees (optional)

---

## 📊 SideShift API Endpoints Used

| Endpoint | Purpose | When Used |
|----------|---------|-----------|
| `GET /coins` | List supported cryptocurrencies | When loading donation page |
| `GET /quote` | Get conversion rate | When user enters donation amount |
| `POST /orders` | Create swap order | When user confirms donation |
| `GET /orders/{id}` | Check order status | When tracking donation progress |
| Webhook | Order status updates | When SideShift completes swap |

---

## 🔐 Security & Trust

- **API Key Security:** Stored only on backend, never exposed to frontend
- **Non-Custodial:** Funds never touch ShiftAid servers - direct from donor → SideShift → NGO
- **Transparency:** All transactions verifiable on blockchain
- **Affiliate ID:** Optional - can recycle fees back to charity fund

---

## 🚀 Why This is Powerful

**SideShift API enables ShiftAid to be:**
- **Borderless:** Accept donations from any blockchain
- **Automatic:** No manual conversion steps
- **Transparent:** Real-time quotes and tracking
- **Efficient:** Single transaction, low fees
- **Scalable:** Support 200+ cryptocurrencies without building infrastructure

**Without SideShift API, ShiftAid would need to:**
- Build swap infrastructure for each blockchain
- Manage liquidity pools
- Handle cross-chain bridges
- Build exchange integrations
- Handle complex routing logic

**With SideShift API, ShiftAid just needs to:**
- Call the API
- Handle the UI/UX
- Track donations
- That's it! 🎉

---

## 📝 Summary

**SideShift API is the core engine that makes cross-chain donations possible.**

It handles all the complex blockchain operations (swaps, bridges, conversions) so ShiftAid can focus on:
- Great user experience
- NGO verification
- Transparency
- Impact tracking

**In one sentence:** SideShift API converts any cryptocurrency into any other cryptocurrency across any blockchain, making it possible for donors to give in their preferred crypto while NGOs receive their preferred stablecoin.

