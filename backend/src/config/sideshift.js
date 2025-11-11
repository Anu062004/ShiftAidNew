import axios from 'axios';

const SIDESHIFT_API_URL = process.env.SIDESHIFT_API_URL || 'https://sideshift.ai/api/v2';
const SIDESHIFT_SECRET = process.env.SIDESHIFT_SECRET || process.env.SIDESHIFT_API_KEY;
const SIDESHIFT_AFFILIATE_ID = process.env.SIDESHIFT_AFFILIATE_ID || process.env.AFFILIATE_ID;

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  if (!SIDESHIFT_SECRET) {
    console.warn('⚠️  SIDESHIFT_SECRET not set. API calls will fail.');
  } else {
    console.log('✅ SideShift Secret configured');
  }

  if (SIDESHIFT_AFFILIATE_ID) {
    console.log('✅ SideShift Affiliate ID:', SIDESHIFT_AFFILIATE_ID);
  }
}

// Create axios instance with default config
const sideshiftApi = axios.create({
  baseURL: SIDESHIFT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-sideshift-secret': SIDESHIFT_SECRET || '',
  },
  timeout: 30000,
});

/**
 * Parse coin format (e.g., "USDC.polygon" -> { coin: "usdc", network: "polygon" })
 * or "BTC" -> { coin: "btc", network: "bitcoin" })
 * SideShift uses lowercase coin names and specific network names
 */
function parseCoin(coinString) {
  if (!coinString) {
    throw new Error('Coin string is required');
  }

  if (coinString.includes('.')) {
    const [coin, network] = coinString.split('.');
    return { 
      coin: coin.toLowerCase().trim(), 
      network: network.toLowerCase().trim() 
    };
  }
  
  // Default networks for common coins (SideShift format)
  const defaultNetworks = {
    'BTC': 'bitcoin',
    'ETH': 'mainnet',
    'MATIC': 'polygon',
    'USDC': 'polygon',  // Default USDC to polygon
    'USDT': 'polygon',  // Default USDT to polygon
    'DAI': 'polygon',   // Default DAI to polygon
  };
  
  const coin = coinString.toUpperCase().trim();
  const network = defaultNetworks[coin] || 'mainnet';
  
  return {
    coin: coin.toLowerCase(),
    network: network
  };
}

/**
 * Get all supported coins
 * Note: SideShift v2 API doesn't have a /coins endpoint
 * This is a placeholder - you may need to maintain a list of supported coins
 */
export const getCoins = async () => {
  try {
    // Common supported coins - you can expand this list
    const commonCoins = [
      { id: 'BTC', name: 'Bitcoin', network: 'bitcoin' },
      { id: 'ETH', name: 'Ethereum', network: 'mainnet' },
      { id: 'MATIC', name: 'Polygon', network: 'polygon' },
      { id: 'USDC.polygon', name: 'USDC (Polygon)', network: 'polygon' },
      { id: 'USDT.polygon', name: 'USDT (Polygon)', network: 'polygon' },
      { id: 'DAI.polygon', name: 'DAI (Polygon)', network: 'polygon' },
      { id: 'USDC.arbitrum', name: 'USDC (Arbitrum)', network: 'arbitrum' },
      { id: 'USDC.mainnet', name: 'USDC (Ethereum)', network: 'mainnet' },
    ];
    return commonCoins;
  } catch (error) {
    console.error('Error fetching coins:', error);
    throw new Error(`Failed to fetch coins: ${error.message}`);
  }
};

/**
 * Get a quote for a swap
 * @param {string} depositCoin - Coin to deposit (e.g., 'BTC' or 'ETH')
 * @param {string} settleCoin - Coin to receive (e.g., 'USDC.polygon' or 'USDC')
 * @param {string} depositAmount - Amount to deposit (optional)
 * @param {string} settleAmount - Amount to receive (optional)
 */
export const getQuote = async (depositCoin, settleCoin, depositAmount = null, settleAmount = null) => {
  try {
    const deposit = parseCoin(depositCoin);
    const settle = parseCoin(settleCoin);

    const payload = {
      depositCoin: deposit.coin,
      depositNetwork: deposit.network,
      settleCoin: settle.coin,
      settleNetwork: settle.network,
    };

    if (depositAmount) {
      payload.depositAmount = depositAmount;
    } else if (settleAmount) {
      payload.settleAmount = settleAmount;
    }

    if (SIDESHIFT_AFFILIATE_ID) {
      payload.affiliateId = SIDESHIFT_AFFILIATE_ID;
    }

    // Ensure amounts are strings if provided
    if (payload.depositAmount) {
      payload.depositAmount = String(payload.depositAmount);
    }
    if (payload.settleAmount) {
      payload.settleAmount = String(payload.settleAmount);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('SideShift Quote Request:', JSON.stringify(payload, null, 2));
      console.log('SideShift API URL:', SIDESHIFT_API_URL);
      console.log('Full URL will be:', `${SIDESHIFT_API_URL}/quotes`);
    }

    const response = await sideshiftApi.post('/quotes', payload);
    return response.data;
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error('SideShift API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Provide more detailed error message
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.error 
      || error.response?.data 
      || error.message;
    
    throw new Error(`Failed to fetch quote: ${errorMessage}`);
  }
};

/**
 * Create a new swap order (fixed shift)
 * This follows the SideShift v2 flow: Request Quote → Create Fixed Shift
 * @param {Object} orderData - Order data
 * @param {string} orderData.depositCoin - Coin to deposit (e.g., 'BTC' or 'ETH')
 * @param {string} orderData.settleCoin - Coin to receive (e.g., 'USDC.polygon')
 * @param {string} orderData.settleAddress - Address to receive funds
 * @param {string} orderData.depositAmount - Amount to deposit (optional)
 * @param {string} orderData.settleAmount - Amount to receive (optional)
 * @param {string} orderData.quoteId - Quote ID from getQuote (optional, will create if not provided)
 */
export const createOrder = async (orderData) => {
  try {
    let quoteId = orderData.quoteId;

    // If no quoteId provided, create a quote first
    if (!quoteId) {
      const deposit = parseCoin(orderData.depositCoin);
      const settle = parseCoin(orderData.settleCoin);

      const quotePayload = {
        depositCoin: deposit.coin,
        depositNetwork: deposit.network,
        settleCoin: settle.coin,
        settleNetwork: settle.network,
      };

      if (orderData.depositAmount) {
        quotePayload.depositAmount = String(orderData.depositAmount);
      } else if (orderData.settleAmount) {
        quotePayload.settleAmount = String(orderData.settleAmount);
      }

      if (SIDESHIFT_AFFILIATE_ID) {
        quotePayload.affiliateId = SIDESHIFT_AFFILIATE_ID;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Creating SideShift quote:', JSON.stringify(quotePayload, null, 2));
      }

      let quoteResponse;
      try {
        quoteResponse = await sideshiftApi.post('/quotes', quotePayload);
        quoteId = quoteResponse.data.id;
        if (process.env.NODE_ENV === 'development') {
          console.log('Quote created successfully:', quoteId);
        }
      } catch (quoteError) {
        console.error('SideShift quote creation failed:', {
          status: quoteError.response?.status,
          data: quoteError.response?.data,
          message: quoteError.message,
        });
        throw new Error(`Failed to create quote: ${quoteError.response?.data?.message || quoteError.response?.data?.error || quoteError.message}`);
      }
    }

    // Create fixed shift using the quote
    const shiftPayload = {
      settleAddress: orderData.settleAddress,
      quoteId: quoteId,
    };

    if (SIDESHIFT_AFFILIATE_ID) {
      shiftPayload.affiliateId = SIDESHIFT_AFFILIATE_ID;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Creating SideShift fixed shift:', JSON.stringify(shiftPayload, null, 2));
    }

    let response;
    try {
      response = await sideshiftApi.post('/shifts/fixed', shiftPayload);
      const shift = response.data;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Fixed shift created successfully:', shift.id);
      }

      // Return in a format compatible with existing code
      return {
        id: shift.id,
        depositAddress: shift.depositAddress,
        depositCoin: orderData.depositCoin,
        settleCoin: orderData.settleCoin,
        depositAmount: shift.depositAmount || orderData.depositAmount,
        settleAmount: shift.settleAmount || orderData.settleAmount,
        quote: {
          id: quoteId,
          rate: shift.rate,
          fees: shift.fees,
        },
        status: shift.status || 'waiting_deposit',
      };
    } catch (shiftError) {
      console.error('SideShift fixed shift creation failed:', {
        status: shiftError.response?.status,
        data: shiftError.response?.data,
        message: shiftError.message,
      });
      throw new Error(`Failed to create fixed shift: ${shiftError.response?.data?.message || shiftError.response?.data?.error || shiftError.message}`);
    }
  } catch (error) {
    console.error('Error creating order:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error; // Re-throw to preserve the error chain
  }
};

/**
 * Get shift status
 * @param {string} shiftId - Shift ID (previously called orderId)
 */
export const getOrder = async (shiftId) => {
  try {
    const response = await sideshiftApi.get(`/shifts/${shiftId}`);
    const shift = response.data;

    // Map SideShift status to our internal status
    const statusMap = {
      'waiting_deposit': 'pending',
      'deposit_received': 'deposit_received',
      'swapping': 'swapping',
      'completed': 'completed',
      'failed': 'failed',
      'expired': 'expired',
    };

    return {
      id: shift.id,
      status: statusMap[shift.status] || shift.status,
      depositAddress: shift.depositAddress,
      depositCoin: shift.depositCoin,
      settleCoin: shift.settleCoin,
      depositAmount: shift.depositAmount,
      settleAmount: shift.settleAmount,
      depositTxHash: shift.depositTxHash,
      settleTxHash: shift.settleTxHash,
    };
  } catch (error) {
    console.error('Error fetching shift:', error.response?.data || error.message);
    throw new Error(`Failed to fetch shift: ${error.response?.data?.message || error.message}`);
  }
};

export default {
  getCoins,
  getQuote,
  createOrder,
  getOrder,
};


