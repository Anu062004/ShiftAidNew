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
  const response = await api.get('/api/ngos', { params });
  return response.data;
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
  const params: any = { depositCoin, settleCoin };
  if (depositAmount) params.depositAmount = depositAmount;
  if (settleAmount) params.settleAmount = settleAmount;
  const response = await api.get('/api/sideshift/quote', { params });
  return response.data;
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
  const response = await api.get(`/api/donations/${id}`);
  return response.data;
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


