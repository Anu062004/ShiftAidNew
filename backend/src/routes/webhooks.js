import express from 'express';
import crypto from 'crypto';
import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import { getOrder } from '../config/sideshift.js';
import { logDonationOnChain } from '../utils/blockchain.js';

const router = express.Router();

// Verify webhook signature (if SideShift provides one)
function verifyWebhookSignature(req, secret) {
  // This is a placeholder - adjust based on SideShift's webhook signature method
  const signature = req.headers['x-sideshift-signature'];
  if (!signature || !secret) {
    return true; // Skip verification if not configured
  }
  // Implement signature verification based on SideShift docs
  return true;
}

// SideShift webhook handler
router.post('/sideshift', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify webhook signature if configured
    if (!verifyWebhookSignature(req, webhookSecret)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.body);

    // Handle different event types
    if (event.type === 'order.updated' || event.type === 'order.completed') {
      const orderId = event.data?.id || event.data?.orderId;

      if (!orderId) {
        return res.status(400).json({ error: 'Missing order ID' });
      }

      // Find donation by SideShift order ID
      const donation = await Donation.findOne({ sideshiftOrderId: orderId });
      if (!donation) {
        console.warn(`Donation not found for order ID: ${orderId}`);
        return res.status(404).json({ error: 'Donation not found' });
      }

      // Fetch latest order status from SideShift
      const order = await getOrder(orderId);

      // Update donation status
      donation.status = mapSideshiftStatus(order.status);
      donation.depositTxHash = order.depositTxHash;
      donation.settleTxHash = order.settleTxHash;

      // If completed, log on-chain and update NGO stats
      if (donation.status === 'completed') {
        try {
          // Log donation on-chain
          const onChainTxHash = await logDonationOnChain({
            donorAddress: donation.donorAddress,
            ngoAddress: donation.settleAddress,
            amount: donation.settleAmount,
            coin: donation.settleCoin,
            sideshiftOrderId: donation.sideshiftOrderId,
          });

          donation.onChainTxHash = onChainTxHash;

          // Update NGO donation stats
          const ngo = await NGO.findById(donation.ngoId);
          if (ngo) {
            ngo.totalDonations += parseFloat(donation.settleAmount) || 0;
            ngo.donationCount += 1;
            await ngo.save();
          }
        } catch (error) {
          console.error('Error logging donation on-chain:', error);
          // Don't fail the webhook if on-chain logging fails
        }
      }

      await donation.save();

      res.json({ success: true, donation: donation.toObject() });
    } else {
      res.json({ success: true, message: 'Event type not handled' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper function to map SideShift status
function mapSideshiftStatus(sideshiftStatus) {
  const statusMap = {
    'waiting_deposit': 'pending',
    'deposit_received': 'deposit_received',
    'swapping': 'swapping',
    'completed': 'completed',
    'failed': 'failed',
    'expired': 'expired',
  };
  return statusMap[sideshiftStatus] || 'pending';
}

export default router;


