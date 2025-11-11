import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donorAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGO',
    required: true,
  },
  sideshiftOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  depositCoin: {
    type: String,
    required: true,
  },
  settleCoin: {
    type: String,
    required: true,
  },
  depositAmount: {
    type: String,
    required: true,
  },
  settleAmount: {
    type: String,
    required: true,
  },
  depositAddress: {
    type: String,
    required: true,
  },
  settleAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'deposit_received', 'swapping', 'completed', 'failed', 'expired'],
    default: 'pending',
  },
  depositTxHash: {
    type: String,
  },
  settleTxHash: {
    type: String,
  },
  onChainTxHash: {
    type: String,
  },
  quote: {
    type: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
donationSchema.index({ donorAddress: 1 });
donationSchema.index({ ngoId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

export default mongoose.model('Donation', donationSchema);


