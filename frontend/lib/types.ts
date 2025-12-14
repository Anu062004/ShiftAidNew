// NGO Types
export interface NGO {
  id: string;
  _id?: string;
  name: string;
  description: string;
  category: 'Education' | 'Healthcare' | 'Environment' | 'Poverty' | 'Disaster Relief' | 'Human Rights' | 'Other';
  walletAddress: string;
  preferredCoin: string;
  website?: string;
  logo?: string;
  verified: boolean;
  totalReceived?: number;
  totalDonations?: number;
  donationCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Donation Types
export interface Donation {
  id: string;
  _id?: string;
  donorAddress: string;
  ngoId: string | NGO;
  sideshiftOrderId: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  depositAddress: string;
  settleAddress: string;
  status: 'pending' | 'deposit_received' | 'swapping' | 'completed' | 'failed' | 'expired';
  depositTxHash?: string;
  settleTxHash?: string;
  quote?: SideShiftQuote;
  metadata?: {
    ngoName?: string;
    ngoCategory?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// SideShift Types
export interface SideShiftCoin {
  id: string;
  name: string;
  network: string;
}

export interface SideShiftQuote {
  id: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  rate?: string;
  fees?: string;
  expiresAt?: string;
}

export interface SideShiftOrder {
  id: string;
  depositAddress: string;
  depositCoin: string;
  settleCoin: string;
  depositAmount: string;
  settleAmount: string;
  status: string;
  depositTxHash?: string;
  settleTxHash?: string;
  quote?: SideShiftQuote;
}

// Dashboard Types
export interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalNGOs: number;
  totalDonors: number;
  recentDonations: Donation[];
}

export interface LeaderboardEntry {
  _id?: string;
  address?: string;
  ngoId?: string;
  name?: string;
  totalAmount: number;
  totalDonated?: number;
  totalReceived?: number;
  donationCount: number;
  ngo?: NGO;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  error: string;
  details?: string;
  hint?: string;
}
