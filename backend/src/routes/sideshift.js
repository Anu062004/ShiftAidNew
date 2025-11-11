import express from 'express';
import { query, validationResult } from 'express-validator';
import { getCoins, getQuote } from '../config/sideshift.js';

const router = express.Router();

// Get all supported coins
router.get('/coins', async (req, res, next) => {
  try {
    const coins = await getCoins();
    res.json(coins);
  } catch (error) {
    next(error);
  }
});

// Get quote for a swap
router.get(
  '/quote',
  [
    query('depositCoin').notEmpty().withMessage('depositCoin is required'),
    query('settleCoin').notEmpty().withMessage('settleCoin is required'),
    query('depositAmount').optional().isString(),
    query('settleAmount').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { depositCoin, settleCoin, depositAmount, settleAmount } = req.query;
      const quote = await getQuote(depositCoin, settleCoin, depositAmount, settleAmount);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  }
);

export default router;


