# Network Configuration Guide

## Current Setup: Polygon

Polygon is currently configured for:
- On-chain donation logging (smart contract)
- Receiving stablecoins (USDC.polygon, USDT.polygon, etc.)
- Wallet connection (Wagmi)

## Why Polygon Was Chosen

1. **Low Transaction Costs**: ~$0.001 per transaction vs Ethereum's $5-50+
2. **Stablecoin Support**: Native USDC, USDT, DAI support
3. **SideShift Integration**: SideShift supports Polygon stablecoins well
4. **Fast Transactions**: ~2 second block time
5. **EVM Compatible**: Works with standard Ethereum tools

## Changing Networks

### Option 1: Ethereum Mainnet
**Pros**: Most established, best stablecoin liquidity
**Cons**: High gas fees ($5-50+ per transaction)

### Option 2: Base (Coinbase L2)
**Pros**: Very low fees, Coinbase backing, growing ecosystem
**Cons**: Newer network, less established

### Option 3: Arbitrum
**Pros**: Low fees, Ethereum L2, good DeFi ecosystem
**Cons**: Slightly more complex setup

### Option 4: Optimism
**Pros**: Low fees, Ethereum L2, simple UX
**Cons**: Similar to Arbitrum

### Option 5: Avalanche
**Pros**: Low fees, fast, good stablecoin support
**Cons**: Less EVM tooling

### Option 6: BSC (Binance Smart Chain)
**Pros**: Very low fees, good stablecoin support
**Cons**: Centralization concerns

## Files to Update When Changing Networks

1. **Frontend** (`frontend/app/providers.tsx`):
   - Change `polygonAmoy` to your chosen chain
   - Update RPC URL

2. **Backend** (`backend/.env`):
   - Update `POLYGON_RPC_URL` to new network RPC

3. **Contracts** (`contracts/hardhat.config.js`):
   - Add new network configuration
   - Update deployment script

4. **Environment Variables**:
   - Update all `POLYGON references to new network name

5. **SideShift Integration**:
   - Ensure SideShift supports your chosen network's stablecoins
   - Update settle coin format (e.g., `USDC.base`, `USDC.arbitrum`)

## Recommended: Keep Polygon

For a donation platform, Polygon remains the best choice because:
- NGOs benefit from low fees (more funds go to cause)
- Fast transaction confirmation
- Excellent stablecoin liquidity
- SideShift has strong Polygon support
- Widely adopted for DeFi applications


