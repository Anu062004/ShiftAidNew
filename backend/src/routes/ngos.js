import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import NGO from '../models/NGO.js';

const router = express.Router();

// Get all NGOs
router.get('/', [
  query('category').optional().isString(),
  query('verified').optional().isBoolean(),
  query('search').optional().isString(),
], async (req, res, next) => {
  try {
    const { category, verified, search } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const ngos = await NGO.find(query).sort({ totalDonations: -1 });
    res.json(ngos);
  } catch (error) {
    next(error);
  }
});

// Get NGO by ID
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const ngo = await NGO.findById(req.params.id);
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
      const existing = await NGO.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: 'NGO with this wallet address already exists' });
      }

      const ngo = new NGO({
        name,
        description,
        category,
        walletAddress: walletAddress.toLowerCase(),
        preferredCoin: preferredCoin || 'USDC.polygon',
        website,
        logo,
        verified: false, // Requires manual verification
      });

      await ngo.save();
      res.status(201).json(ngo);
    } catch (error) {
      next(error);
    }
  }
);

// Verify NGO (admin only - in production, add auth middleware)
router.patch('/:id/verify', [param('id').isMongoId()], async (req, res, next) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    ngo.verified = true;
    await ngo.save();

    res.json(ngo);
  } catch (error) {
    next(error);
  }
});

export default router;


