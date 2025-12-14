import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { NGOs, usingSupabase } from '../db/adapter.js';

const router = express.Router();

// Get all NGOs
router.get('/', [
  query('category').optional().isString(),
  query('verified').optional().isBoolean(),
  query('search').optional().isString(),
], async (req, res, next) => {
  try {
    const { category, verified, search } = req.query;
    const ngos = await NGOs.list({
      category,
      verified: verified !== undefined ? verified === 'true' : undefined,
      search
    });
    
    // Always return an array, even if empty
    if (!ngos || !Array.isArray(ngos)) {
      return res.json([]);
    }
    
    res.json(ngos);
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json([]);
  }
});

// Get NGO by ID
router.get('/:id', [param('id').custom((v)=>true)], async (req, res, next) => {
  try {
    const ngo = await NGOs.getById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }
    res.json(ngo);
  } catch (error) {
    next(error);
  }
});

// Create new NGO (for admin/registration)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['Education', 'Healthcare', 'Environment', 'Poverty', 'Disaster Relief', 'Human Rights', 'Other']),
    body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
    body('preferredCoin').optional().isString(),
    body('website').optional().isURL(),
    body('logo').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, category, walletAddress, preferredCoin, website, logo } = req.body;

      // Check if NGO with this wallet already exists
      const existing = await NGOs.findByWallet(walletAddress);
      if (existing) {
        return res.status(400).json({ error: 'NGO with this wallet address already exists' });
      }

      const ngo = await NGOs.create({
        name,
        description,
        category,
        walletAddress: walletAddress.toLowerCase(),
        preferredCoin: preferredCoin || 'USDC.polygon',
        website,
        logo,
        verified: false,
      });

      res.status(201).json(ngo);
    } catch (error) {
      next(error);
    }
  }
);

// Verify NGO (admin only - in production, add auth middleware)
router.patch('/:id/verify', [param('id').custom((v)=>true)], async (req, res, next) => {
  try {
    const ngo = await NGOs.verify(req.params.id);
    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    res.json(ngo);
  } catch (error) {
    next(error);
  }
});

export default router;


