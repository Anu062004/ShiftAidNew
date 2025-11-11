import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Education', 'Healthcare', 'Environment', 'Poverty', 'Disaster Relief', 'Human Rights', 'Other'],
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  preferredCoin: {
    type: String,
    required: true,
    default: 'USDC.polygon',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationSignature: {
    type: String,
  },
  website: {
    type: String,
  },
  logo: {
    type: String,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  donationCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for search
ngoSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('NGO', ngoSchema);


