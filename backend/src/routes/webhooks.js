import express from 'express';
import crypto from 'crypto';
import { Donations, NGOs } from '../db/adapter.js';
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
      const donation = await Donations.findByOrderId(orderId);
      if (!donation) {
        console.warn(`Donation not found for order ID: ${orderId}`);
        return res.status(404).json({ error: 'Donation not found' });
      }

      // Fetch latest order status from SideShift
      // For webhooks, we don't have an end-user IP, but we can try to extract it from the request
      // This is optional since webhooks come from SideShift's servers
      const userIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     null;
      const order = await getOrder(orderId, userIP);

      // Update donation status
      const updatedDonation = await Donations.update(donation.id, {
        status: mapSideshiftStatus(order.status),
        depositTxHash: order.depositTxHash || null,
        settleTxHash: order.settleTxHash || null,
      });

      // If completed, log on-chain and update NGO stats
      if (updatedDonation.status === 'completed') {
        try {
          // Log donation on-chain
          const onChainTxHash = await logDonationOnChain({
            donorAddress: updatedDonation.donorAddress,
            ngoAddress: updatedDonation.settleAddress,
            amount: updatedDonation.settleAmount,
            coin: updatedDonation.settleCoin,
            sideshiftOrderId: updatedDonation.sideshiftOrderId,
          });

          await Donations.update(updatedDonation.id, { onChainTxHash });

          // Update NGO donation stats
          const ngo = await NGOs.getById(updatedDonation.ngoId);
          if (ngo) {
            await NGOs.update(ngo.id, {
              totalDonations: (parseFloat(ngo.totalDonations) || 0) + parseFloat(updatedDonation.settleAmount || 0),
              donationCount: (ngo.donationCount || 0) + 1,
            });
          }
        } catch (error) {
          console.error('Error logging donation on-chain:', error);
          // Don't fail the webhook if on-chain logging fails
        }
      }

      res.json({ success: true, donation: updatedDonation });
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


