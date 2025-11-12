import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Donations, NGOs } from '../db/adapter.js';
import { createOrder, getOrder } from '../config/sideshift.js';
import { logDonationOnChain } from '../utils/blockchain.js';

const router = express.Router();

// Create a new donation order
router.post(
  '/',
  [
    body('ngoId').isString().withMessage('Invalid NGO ID'),
    body('depositCoin').notEmpty().withMessage('Deposit coin is required'),
    body('settleCoin').notEmpty().withMessage('Settle coin is required'),
    body('donorAddress')
      .notEmpty()
      .withMessage('Donor address is required')
      .isString()
      .withMessage('Donor address must be a string')
      .custom((value) => {
        const normalized = String(value).trim().toLowerCase();
        if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
          throw new Error('Invalid Ethereum address format');
        }
        return true;
      })
      .withMessage('Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)'),
    body('depositAmount').optional().isString(),
    body('settleAmount').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { ngoId, depositCoin, settleCoin, donorAddress, depositAmount, settleAmount } = req.body;

      // Validate donor address format
      if (!donorAddress || typeof donorAddress !== 'string') {
        return res.status(400).json({ 
          error: 'Donor address is required',
          details: 'Wallet address must be provided and must be a string'
        });
      }

      // Normalize address (lowercase, remove whitespace)
      const normalizedDonorAddress = donorAddress.trim().toLowerCase();

      if (!/^0x[a-f0-9]{40}$/.test(normalizedDonorAddress)) {
        return res.status(400).json({ 
          error: 'Invalid donor address format',
          details: 'Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)',
          received: donorAddress.substring(0, 20) + '...' // Show first 20 chars for debugging
        });
      }

      // Verify NGO exists and is verified
      const ngo = await NGOs.getById(ngoId);
      if (!ngo) {
        return res.status(404).json({ error: 'NGO not found' });
      }
      if (!ngo.verified) {
        return res.status(400).json({ error: 'NGO is not verified' });
      }

      // Validate NGO wallet address format (normalize whitespace/case)
      const ngoWalletRaw = (ngo.walletAddress || '').trim();
      const ngoWallet = ngoWalletRaw.toLowerCase();
      if (!/^0x[a-f0-9]{40}$/.test(ngoWallet)) {
        return res.status(400).json({
          error: 'Invalid NGO wallet address format',
          details: 'Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)',
          received: ngoWalletRaw.substring(0, 20) + '...'
        });
      }

      // Validate that we have either depositAmount or settleAmount
      if (!depositAmount && !settleAmount) {
        return res.status(400).json({ 
          error: 'Either depositAmount or settleAmount is required' 
        });
      }

      // Validate that depositCoin and settleCoin are different
      if (depositCoin === settleCoin) {
        return res.status(400).json({ 
          error: 'Cannot swap the same coin',
          details: 'Deposit coin and settle coin must be different. Please select a different cryptocurrency to donate or a different coin for the NGO to receive.'
        });
      }

      // Create SideShift order
      const orderData = {
        depositCoin,
        settleCoin,
        settleAddress: ngoWallet,
        depositAmount,
        settleAmount,
      };

      console.log('Creating SideShift order with:', {
        depositCoin,
        settleCoin,
        settleAddress: ngoWallet,
        depositAmount,
        settleAmount,
      });

      let sideshiftOrder;
      try {
        sideshiftOrder = await createOrder(orderData);
        console.log('SideShift order created:', sideshiftOrder.id);
      } catch (error) {
        console.error('SideShift order creation failed:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
          status: error.response?.status,
        });
        
        // Provide more detailed error message
        const errorDetails = error.response?.data || {};
        const errorMessage = errorDetails.message || errorDetails.error || error.message || 'Unknown error';
        
        // Extract more detailed error information
        const sideShiftErrorMsg = errorDetails.message || errorDetails.error || errorDetails.code || '';
        const fullErrorMessage = sideShiftErrorMsg || errorMessage;
        
        return res.status(500).json({ 
          error: 'Failed to create swap order',
          details: fullErrorMessage,
          sideShiftError: errorDetails,
          hint: depositCoin === settleCoin 
            ? 'You cannot swap the same coin. Please select different coins for deposit and settlement.'
            : 'Please check that both coins are supported and the swap is valid.',
        });
      }

      // Create donation record
      const donation = await Donations.create({
        donorAddress: normalizedDonorAddress,
        ngoId,
        sideshiftOrderId: sideshiftOrder.id,
        depositCoin,
        settleCoin,
        depositAmount: sideshiftOrder.depositAmount || depositAmount,
        settleAmount: sideshiftOrder.settleAmount || settleAmount,
        depositAddress: sideshiftOrder.depositAddress,
        settleAddress: ngoWallet,
        status: 'pending',
        quote: sideshiftOrder.quote,
        metadata: {
          ngoName: ngo.name,
          ngoCategory: ngo.category,
        },
      });

      res.status(201).json({
        donation,
        sideshiftOrder: {
          id: sideshiftOrder.id,
          depositAddress: sideshiftOrder.depositAddress,
          depositCoin: sideshiftOrder.depositCoin,
          settleCoin: sideshiftOrder.settleCoin,
          depositAmount: sideshiftOrder.depositAmount,
          settleAmount: sideshiftOrder.settleAmount,
          quote: sideshiftOrder.quote,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get donation by ID
router.get('/:id', [param('id').isString()], async (req, res, next) => {
  try {
    const donation = await Donations.getById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Fetch NGO data if ngoId exists
    if (donation.ngoId) {
      try {
        const ngo = await NGOs.getById(donation.ngoId);
        if (ngo) {
          donation.ngoId = ngo; // Replace UUID with full NGO object
        }
      } catch (error) {
        console.error('Error fetching NGO:', error);
        // Keep ngoId as UUID if fetch fails
      }
    }

    // Fetch latest status from SideShift
    try {
      const order = await getOrder(donation.sideshiftOrderId);
      const updated = {
        status: mapSideshiftStatus(order.status),
        depositTxHash: order.depositTxHash,
        settleTxHash: order.settleTxHash,
      };
      await Donations.update(donation.id, updated);
      Object.assign(donation, updated);
    } catch (error) {
      console.error('Error fetching order status:', error);
    }

    res.json(donation);
  } catch (error) {
    next(error);
  }
});

// Get donations by donor address
router.get('/donor/:address', [param('address').isEthereumAddress()], async (req, res, next) => {
  try {
    const donations = await Donations.listByDonor(req.params.address.toLowerCase());

    res.json(donations);
  } catch (error) {
    next(error);
  }
});

// Get donations by NGO
router.get('/ngo/:ngoId', [param('ngoId').isString()], async (req, res, next) => {
  try {
    const donations = await Donations.listByNGO(req.params.ngoId);

    res.json(donations);
  } catch (error) {
    next(error);
  }
});

// Get all donations with pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'deposit_received', 'swapping', 'completed', 'failed', 'expired']),
], async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;

    const { donations, total } = await Donations.list({ page, limit, status });

    res.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to map SideShift status to our status
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


