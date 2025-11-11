import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import { createOrder, getOrder } from '../config/sideshift.js';
import { logDonationOnChain } from '../utils/blockchain.js';

const router = express.Router();

// Create a new donation order
router.post(
  '/',
  [
    body('ngoId').isMongoId().withMessage('Invalid NGO ID'),
    body('depositCoin').notEmpty().withMessage('Deposit coin is required'),
    body('settleCoin').notEmpty().withMessage('Settle coin is required'),
    body('donorAddress').isEthereumAddress().withMessage('Invalid donor address'),
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

      // Verify NGO exists and is verified
      const ngo = await NGO.findById(ngoId);
      if (!ngo) {
        return res.status(404).json({ error: 'NGO not found' });
      }
      if (!ngo.verified) {
        return res.status(400).json({ error: 'NGO is not verified' });
      }

      // Validate NGO wallet address format
      if (!ngo.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(ngo.walletAddress)) {
        return res.status(400).json({ 
          error: 'Invalid NGO wallet address format',
          details: 'Wallet address must be a valid Ethereum address (0x followed by 40 hex characters)'
        });
      }

      // Validate that we have either depositAmount or settleAmount
      if (!depositAmount && !settleAmount) {
        return res.status(400).json({ 
          error: 'Either depositAmount or settleAmount is required' 
        });
      }

      // Create SideShift order
      const orderData = {
        depositCoin,
        settleCoin,
        settleAddress: ngo.walletAddress,
        depositAmount,
        settleAmount,
      };

      console.log('Creating SideShift order with:', {
        depositCoin,
        settleCoin,
        settleAddress: ngo.walletAddress,
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
        
        return res.status(500).json({ 
          error: 'Failed to create swap order',
          details: errorMessage,
          sideShiftError: errorDetails,
        });
      }

      // Create donation record
      const donation = new Donation({
        donorAddress,
        ngoId,
        sideshiftOrderId: sideshiftOrder.id,
        depositCoin,
        settleCoin,
        depositAmount: sideshiftOrder.depositAmount || depositAmount,
        settleAmount: sideshiftOrder.settleAmount || settleAmount,
        depositAddress: sideshiftOrder.depositAddress,
        settleAddress: ngo.walletAddress,
        status: 'pending',
        quote: sideshiftOrder.quote,
        metadata: {
          ngoName: ngo.name,
          ngoCategory: ngo.category,
        },
      });

      await donation.save();

      res.status(201).json({
        donation: donation.toObject(),
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
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('ngoId');
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Fetch latest status from SideShift
    try {
      const order = await getOrder(donation.sideshiftOrderId);
      donation.status = mapSideshiftStatus(order.status);
      donation.depositTxHash = order.depositTxHash;
      donation.settleTxHash = order.settleTxHash;
      await donation.save();
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
    const donations = await Donation.find({ donorAddress: req.params.address.toLowerCase() })
      .populate('ngoId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(donations);
  } catch (error) {
    next(error);
  }
});

// Get donations by NGO
router.get('/ngo/:ngoId', [param('ngoId').isMongoId()], async (req, res, next) => {
  try {
    const donations = await Donation.find({ ngoId: req.params.ngoId })
      .sort({ createdAt: -1 })
      .limit(100);

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
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('ngoId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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


