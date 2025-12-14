/**
 * @typedef {Object} NGO
 * @property {string} id - NGO unique identifier
 * @property {string} name - NGO name
 * @property {string} description - NGO description
 * @property {string} category - NGO category
 * @property {string} walletAddress - NGO wallet address
 * @property {string} preferredCoin - Preferred cryptocurrency
 * @property {string} [website] - NGO website URL
 * @property {string} [logo] - NGO logo URL
 * @property {boolean} verified - Verification status
 * @property {number} [totalReceived] - Total amount received
 * @property {number} [donationCount] - Number of donations
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Update timestamp
 */

/**
 * @typedef {Object} Donation
 * @property {string} id - Donation unique identifier
 * @property {string} donorAddress - Donor wallet address
 * @property {string} ngoId - NGO identifier
 * @property {string} sideshiftOrderId - SideShift order ID
 * @property {string} depositCoin - Coin to deposit
 * @property {string} settleCoin - Coin to settle
 * @property {string} depositAmount - Amount to deposit
 * @property {string} settleAmount - Amount to settle
 * @property {string} depositAddress - Deposit address
 * @property {string} settleAddress - Settlement address
 * @property {string} status - Donation status
 * @property {string} [depositTxHash] - Deposit transaction hash
 * @property {string} [settleTxHash] - Settlement transaction hash
 * @property {Object} [quote] - SideShift quote
 * @property {Object} [metadata] - Additional metadata
 * @property {Date} [createdAt] - Creation timestamp
 * @property {Date} [updatedAt] - Update timestamp
 */

/**
 * @typedef {Object} SideShiftQuote
 * @property {string} id - Quote ID
 * @property {string} depositCoin - Deposit coin
 * @property {string} settleCoin - Settle coin
 * @property {string} depositAmount - Deposit amount
 * @property {string} settleAmount - Settle amount
 * @property {string} [rate] - Exchange rate
 * @property {string} [fees] - Fees
 * @property {string} [expiresAt] - Expiration timestamp
 */

/**
 * @typedef {Object} SideShiftOrder
 * @property {string} id - Order ID
 * @property {string} depositAddress - Deposit address
 * @property {string} depositCoin - Deposit coin
 * @property {string} settleCoin - Settle coin
 * @property {string} depositAmount - Deposit amount
 * @property {string} settleAmount - Settle amount
 * @property {string} status - Order status
 * @property {string} [depositTxHash] - Deposit transaction hash
 * @property {string} [settleTxHash] - Settlement transaction hash
 * @property {SideShiftQuote} [quote] - Quote information
 */

export {};
