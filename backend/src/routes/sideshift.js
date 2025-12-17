import express from 'express';
import { query, validationResult } from 'express-validator';
import { getCoins, getQuote } from '../config/sideshift.js';
import { getUserIP } from '../utils/get-user-ip.js';

const router = express.Router();

// Get all supported coins
router.get('/coins', async (req, res, next) => {
  try {
    const coins = await getCoins(req);
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
      
      // Use user IP from middleware (req.userIp)
      const userIP = req.userIp || '0.0.0.0';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Quote request:', { depositCoin, settleCoin, depositAmount, settleAmount, userIP });
      }
      
      const quote = await getQuote(depositCoin, settleCoin, depositAmount, settleAmount, userIP);
      res.json(quote);
    } catch (error) {
      // Provide better error response for quote errors
      const statusCode = error.response?.status || 500;
      
      // Extract error message from the error
      let errorMessage = error.message || 'Failed to fetch quote';
      
      // Remove the "Failed to fetch quote: " prefix if it exists
      if (errorMessage.startsWith('Failed to fetch quote: ')) {
        errorMessage = errorMessage.replace('Failed to fetch quote: ', '');
      }
      
      // Extract detailed error information from response
      let details = errorMessage;
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle different data types
        if (typeof data === 'string') {
          details = data;
        } else if (typeof data === 'object' && data !== null) {
          // Try to extract message from various fields
          if (data.message && typeof data.message === 'string') {
            details = data.message;
          } else if (data.error) {
            if (typeof data.error === 'string') {
              details = data.error;
            } else if (typeof data.error === 'object' && data.error !== null) {
              if (data.error.message) {
                details = String(data.error.message);
              } else {
                details = JSON.stringify(data.error);
              }
            } else {
              details = String(data.error);
            }
          } else if (data.details) {
            if (typeof data.details === 'string') {
              details = data.details;
            } else if (typeof data.details === 'object' && data.details !== null) {
              if (data.details.message) {
                details = String(data.details.message);
              } else {
                details = JSON.stringify(data.details);
              }
            } else {
              details = String(data.details);
            }
          } else if (data.code) {
            // Some APIs return code + message
            details = data.message ? String(data.message) : `Error code: ${data.code}`;
          } else {
            // Last resort: stringify the whole object
            try {
              const errorStr = JSON.stringify(data);
              // Limit length to avoid huge error messages
              details = errorStr.length > 200 ? errorStr.substring(0, 200) + '...' : errorStr;
            } catch (e) {
              details = errorMessage;
            }
          }
        } else {
          details = String(data);
        }
      }
      
      // Final safety check - ensure details is always a string
      if (typeof details !== 'string') {
        try {
          details = JSON.stringify(details);
        } catch (e) {
          details = 'Failed to fetch quote. Please check your inputs and try again.';
        }
      }
      
      // Limit length to avoid huge error messages
      if (details.length > 300) {
        details = details.substring(0, 300) + '...';
      }
      
      return res.status(statusCode).json({
        error: 'Failed to fetch quote',
        details: details, // This is now guaranteed to be a string
        hint: 'Please check that both coins are supported and the swap is valid.',
      });
    }
  }
);

export default router;


