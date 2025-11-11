import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Simple ABI for logging donations
const DONATION_ROUTER_ABI = [
  'function logDonation(address donor, address ngo, string memory amount, string memory coin, string memory orderId) public returns (bytes32)',
  'event DonationLogged(address indexed donor, address indexed ngo, string amount, string coin, string orderId, bytes32 txHash)',
];

/**
 * Log donation on-chain
 * @param {Object} donationData
 * @param {string} donationData.donorAddress
 * @param {string} donationData.ngoAddress
 * @param {string} donationData.amount
 * @param {string} donationData.coin
 * @param {string} donationData.sideshiftOrderId
 */
export async function logDonationOnChain(donationData) {
  if (!POLYGON_RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn('⚠️  Blockchain logging not configured. Skipping on-chain log.');
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DONATION_ROUTER_ABI, wallet);

    const tx = await contract.logDonation(
      donationData.donorAddress,
      donationData.ngoAddress,
      donationData.amount,
      donationData.coin,
      donationData.sideshiftOrderId
    );

    const receipt = await tx.wait();
    console.log('✅ Donation logged on-chain:', receipt.hash);
    return receipt.hash;
  } catch (error) {
    console.error('❌ Error logging donation on-chain:', error);
    throw error;
  }
}

/**
 * Verify donation on-chain
 * @param {string} txHash
 */
export async function verifyDonationOnChain(txHash) {
  if (!POLYGON_RPC_URL || !CONTRACT_ADDRESS) {
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DONATION_ROUTER_ABI, provider);

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return null;
    }

    // Parse events from receipt
    const logs = receipt.logs;
    // In a real implementation, decode the events here

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmed: receipt.status === 1,
    };
  } catch (error) {
    console.error('Error verifying donation on-chain:', error);
    return null;
  }
}


