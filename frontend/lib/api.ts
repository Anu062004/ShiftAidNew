import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NGOs
export const getNGOs = async (params?: { category?: string; verified?: boolean; search?: string }) => {
  try {
    const response = await api.get('/api/ngos', { params });
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { code?: string; message?: string; response?: unknown };
    if (apiError.code === 'ECONNREFUSED' || apiError.message?.includes('Network Error') || !apiError.response) {
      throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_URL}`);
    }
    throw error;
  }
};

export const getNGO = async (id: string) => {
  const response = await api.get(`/api/ngos/${id}`);
  return response.data;
};

// SideShift
export const getCoins = async () => {
  const response = await api.get('/api/sideshift/coins');
  return response.data;
};

export const getQuote = async (depositCoin: string, settleCoin: string, depositAmount?: string, settleAmount?: string) => {
  try {
    const params: Record<string, string> = { depositCoin, settleCoin };
    if (depositAmount) params.depositAmount = depositAmount;
    if (settleAmount) params.settleAmount = settleAmount;
    const response = await api.get('/api/sideshift/quote', { params });
    return response.data;
  } catch (error: unknown) {
    // Extract error message properly - ensure it's always a string
    let errorMessage = 'Failed to fetch quote';
    const apiError = error as { response?: { data?: unknown }; message?: string };
    
    try {
      // Log for debugging
      console.log('API getQuote error:', error);
      console.log('API error response:', apiError.response);
      console.log('API error response data:', apiError.response?.data);
      
      if (apiError.response?.data) {
        const data = apiError.response.data as Record<string, unknown>;
        
        // Check details field first (most specific - backend returns this)
        if (data.details !== undefined && data.details !== null) {
          if (typeof data.details === 'string') {
            errorMessage = data.details;
          } else if (typeof data.details === 'object' && data.details !== null) {
            // If details is an object, try to extract message or stringify
            const detailsObj = data.details as { message?: string };
            if (detailsObj.message && typeof detailsObj.message === 'string') {
              errorMessage = detailsObj.message;
            } else {
              try {
                errorMessage = JSON.stringify(data.details);
              } catch (_e) {
                errorMessage = 'Failed to parse error details';
              }
            }
          } else {
            errorMessage = String(data.details);
          }
        }
        // Check error field
        else if (data.error !== undefined && data.error !== null) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (typeof data.error === 'object' && data.error !== null) {
            const errorObj = data.error as { message?: string };
            if (errorObj.message && typeof errorObj.message === 'string') {
              errorMessage = errorObj.message;
            } else {
              try {
                errorMessage = JSON.stringify(data.error);
              } catch (_e) {
                errorMessage = 'Failed to parse error';
              }
            }
          } else {
            errorMessage = String(data.error);
          }
        }
        // Check message field
        else if (data.message !== undefined && data.message !== null) {
          if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else {
            errorMessage = String(data.message);
          }
        }
        // If data itself is a string
        else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      // Fallback to error.message (but check it's not "[object Object]")
      else if (apiError.message && typeof apiError.message === 'string') {
        const msg = apiError.message;
        // If message contains "[object Object]", don't use it
        if (!msg.includes('[object Object]')) {
          // Remove prefix if present
          if (msg.startsWith('Failed to fetch quote: ')) {
            errorMessage = msg.replace('Failed to fetch quote: ', '');
          } else {
            errorMessage = msg;
          }
        }
      }
      
      // Final safety check - ensure it's a string and not "[object Object]"
      if (typeof errorMessage !== 'string') {
        try {
          errorMessage = JSON.stringify(errorMessage);
        } catch (_e) {
          errorMessage = 'Failed to fetch quote';
        }
      }
      
      // If we still have "[object Object]", provide a generic message
      if (errorMessage.includes('[object Object]')) {
        errorMessage = 'Failed to fetch quote. Please check that both coins are supported and try again.';
      }
      
      console.log('API extracted error message:', errorMessage);
    } catch (extractError) {
      console.error('Error extracting error message:', extractError);
      errorMessage = 'Failed to fetch quote. Please check your inputs and try again.';
    }
    
    // Create a new error with the extracted message (guaranteed to be a string)
    const quoteError = new Error(errorMessage);
    (quoteError as Error & { response?: unknown }).response = apiError.response;
    throw quoteError;
  }
};

// Donations
export const createDonation = async (donationData: {
  ngoId: string;
  depositCoin: string;
  settleCoin: string;
  donorAddress: string;
  depositAmount?: string;
  settleAmount?: string;
}) => {
  const response = await api.post('/api/donations', donationData);
  return response.data;
};

export const getDonation = async (id: string) => {
  try {
    const response = await api.get(`/api/donations/${id}`);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number } };
    if (apiError.response?.status === 404) {
      throw new Error('Donation not found');
    }
    throw error;
  }
};

export const getDonations = async (params?: { page?: number; limit?: number; status?: string }) => {
  const response = await api.get('/api/donations', { params });
  return response.data;
};

export const getDonationsByDonor = async (address: string) => {
  const response = await api.get(`/api/donations/donor/${address}`);
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getLeaderboard = async (type: 'donors' | 'ngos' = 'donors', limit: number = 50) => {
  const response = await api.get('/api/dashboard/leaderboard', { params: { type, limit } });
  return response.data;
};

export default api;


