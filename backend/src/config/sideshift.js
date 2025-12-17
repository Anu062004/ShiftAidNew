import axios from 'axios';
import { getValidIPForAPI } from '../utils/get-public-ip.js';

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
    'x-api-key': SIDESHIFT_SECRET || '',
  },
  timeout: 30000,
});

/**
 * Extract error message from SideShift API error response
 * Handles objects, strings, and nested properties properly
 */
function extractErrorMessage(error) {
  if (!error) return 'Unknown error';
  
  // If error.response?.data exists, extract from there
  if (error.response?.data) {
    const data = error.response.data;
    
    // If data is a string, use it directly
    if (typeof data === 'string') {
      return data;
    }
    // If data has a message property
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    // If data has an error property
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
    // If data has a code property
    if (data.code && typeof data.code === 'string') {
      return data.code;
    }
    // Otherwise, try to stringify the object (but limit length)
    if (typeof data === 'object') {
      try {
        const jsonStr = JSON.stringify(data);
        return jsonStr.length > 200 ? jsonStr.substring(0, 200) + '...' : jsonStr;
      } catch (e) {
        return 'Invalid response from SideShift API';
      }
    }
  }
  
  // Fallback to error.message
  return error.message || 'Unknown error';
}

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
 * @param {string} userIP - User's IP address for x-user-ip header (required)
 */
export const getQuote = async (depositCoin, settleCoin, depositAmount = null, settleAmount = null, userIP = null) => {
  try {
    // Validate API key is configured
    if (!SIDESHIFT_SECRET || SIDESHIFT_SECRET === 'your_sideshift_api_key_here' || SIDESHIFT_SECRET.includes('your_') || SIDESHIFT_SECRET.includes('REPLACE')) {
      throw new Error('SideShift API key is not configured. Please set SIDESHIFT_API_KEY or SIDESHIFT_SECRET in your .env file with your actual API key from https://sideshift.ai/');
    }
    
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

    // Add x-user-ip header to the request (required by SideShift when proxying requests)
    // See: https://docs.sideshift.ai/api-intro/permissions/#the-x-user-ip-header
    // SideShift rejects '0.0.0.0' and localhost IPs, so we need a valid public IP
    // In development, we'll fetch the server's public IP as a fallback
    const validUserIP = await getValidIPForAPI(userIP);
    
    if (!validUserIP) {
      const errorMsg = process.env.NODE_ENV === 'development'
        ? 'Cannot fetch quote: Unable to determine a valid IP address for SideShift API. Please check your internet connection.'
        : 'User IP address is required for SideShift API requests. The request must include a valid public IP address.';
      throw new Error(errorMsg);
    }
    
    const requestConfig = {
      headers: {
        'x-user-ip': validUserIP,
        'x-api-key': SIDESHIFT_SECRET || '',
      },
    };

    const response = await sideshiftApi.post('/quotes', payload, requestConfig);
    const quoteData = response.data;
    
    // Transform response to ensure compatibility with frontend
    // SideShift API returns the quote - map to our expected format while preserving original coin format
    // Use original coin strings for display, but SideShift response should have the correct values
    return {
      id: quoteData.id,
      depositCoin: depositCoin, // Use original format (e.g., "BTC" or "USDC.polygon")
      settleCoin: settleCoin,   // Use original format
      depositAmount: quoteData.depositAmount || quoteData.depositValue || depositAmount,
      settleAmount: quoteData.settleAmount || quoteData.settleValue || settleAmount,
      rate: quoteData.rate || quoteData.exchangeRate,
      fees: quoteData.fees || quoteData.fee,
      expiresAt: quoteData.expiresAt || quoteData.expires,
      ...quoteData, // Include any additional fields from SideShift
    };
  } catch (error) {
    console.error('SideShift API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Extract error message properly
    let errorMessage = 'Unknown error';
    
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (data.code) {
        errorMessage = `Error ${data.code}: ${data.message || 'Unknown error'}`;
      } else {
        // Try to stringify the object, but limit length
        try {
          const errorStr = JSON.stringify(data);
          errorMessage = errorStr.length > 200 ? errorStr.substring(0, 200) + '...' : errorStr;
        } catch (e) {
          errorMessage = 'Failed to parse error response';
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create a proper error object that can be serialized
    const quoteError = new Error(`Failed to fetch quote: ${errorMessage}`);
    quoteError.response = error.response;
    throw quoteError;
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
 * @param {string} userIP - User's IP address for x-user-ip header (required)
 */
export const createOrder = async (orderData, userIP = null) => {
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
        // Add x-user-ip header to quote request (required by SideShift when proxying requests)
        // See: https://docs.sideshift.ai/api-intro/permissions/#the-x-user-ip-header
        // In development, we'll fetch the server's public IP as a fallback for localhost
        const validUserIP = await getValidIPForAPI(userIP);
        
        if (!validUserIP) {
          const errorMsg = process.env.NODE_ENV === 'development'
            ? 'Cannot create quote: Unable to determine a valid IP address for SideShift API. Please check your internet connection.'
            : 'User IP address is required for SideShift API requests. Please ensure the request includes a valid IP address.';
          throw new Error(errorMsg);
        }
        
        const quoteConfig = {
          headers: {
            'x-user-ip': validUserIP,
            'x-api-key': SIDESHIFT_SECRET || '',
          },
        };
        quoteResponse = await sideshiftApi.post('/quotes', quotePayload, quoteConfig);
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
        const errorMessage = extractErrorMessage(quoteError);
        throw new Error(`Failed to create quote: ${errorMessage}`);
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
      // Add x-user-ip header to fixed shift request (required by SideShift when proxying requests)
      // See: https://docs.sideshift.ai/api-intro/permissions/#the-x-user-ip-header
      // In development, we'll fetch the server's public IP as a fallback for localhost
      const validUserIP = await getValidIPForAPI(userIP);
      
      if (!validUserIP) {
        const errorMsg = process.env.NODE_ENV === 'development'
          ? 'Cannot create shift: Unable to determine a valid IP address for SideShift API. Please check your internet connection.'
          : 'User IP address is required for SideShift API requests. Please ensure the request includes a valid IP address.';
        throw new Error(errorMsg);
      }
      
      const shiftConfig = {
        headers: {
          'x-user-ip': validUserIP,
          'x-api-key': SIDESHIFT_SECRET || '',
        },
      };
      response = await sideshiftApi.post('/shifts/fixed', shiftPayload, shiftConfig);
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
      const errorMessage = extractErrorMessage(shiftError);
      throw new Error(`Failed to create fixed shift: ${errorMessage}`);
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
 * @param {string} userIP - User's IP address for x-user-ip header (optional)
 */
export const getOrder = async (shiftId, userIP = null) => {
  try {
    // Add x-user-ip header to get order request (required by SideShift when proxying requests)
    // See: https://docs.sideshift.ai/api-intro/permissions/#the-x-user-ip-header
    // In development, we'll fetch the server's public IP as a fallback for localhost
    const validUserIP = await getValidIPForAPI(userIP) || '8.8.8.8'; // Fallback for read operations
    
    const requestConfig = {
      headers: {
        'x-user-ip': validUserIP,
        'x-api-key': SIDESHIFT_SECRET || '',
      },
    };
    const response = await sideshiftApi.get(`/shifts/${shiftId}`, requestConfig);
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
    const errorMessage = extractErrorMessage(error);
    throw new Error(`Failed to fetch shift: ${errorMessage}`);
  }
};

export default {
  getCoins,
  getQuote,
  createOrder,
  getOrder,
};


