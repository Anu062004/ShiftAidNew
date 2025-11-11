import express from 'express';
import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$settleAmount' } } } },
    ]);

    const totalAmountValue = totalAmount[0]?.total || 0;

    const topDonors = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$donorAddress',
          totalDonated: { $sum: { $toDouble: '$settleAmount' } },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalDonated: -1 } },
      { $limit: 10 },
    ]);

    const topNGOs = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$ngoId',
          totalReceived: { $sum: { $toDouble: '$settleAmount' } },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalReceived: -1 } },
      { $limit: 10 },
    ]);

    // Populate NGO names
    const ngoIds = topNGOs.map((item) => item._id);
    const ngos = await NGO.find({ _id: { $in: ngoIds } });
    const ngoMap = new Map(ngos.map((ngo) => [ngo._id.toString(), ngo]));

    const topNGOsWithNames = topNGOs.map((item) => ({
      ...item,
      ngo: ngoMap.get(item._id.toString()) || null,
    }));

    // Recent donations
    const recentDonations = await Donation.find({ status: 'completed' })
      .populate('ngoId')
      .sort({ createdAt: -1 })
      .limit(20);

    // Weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyDonations = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: { $toDouble: '$settleAmount' } },
        },
      },
    ]);

    res.json({
      totalDonations,
      totalAmount: totalAmountValue,
      topDonors,
      topNGOs: topNGOsWithNames,
      recentDonations,
      weeklyStats: {
        donations: weeklyDonations[0]?.count || 0,
        amount: weeklyDonations[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { type = 'donors', limit = 50 } = req.query;

    if (type === 'donors') {
      const topDonors = await Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$donorAddress',
            totalDonated: { $sum: { $toDouble: '$settleAmount' } },
            donationCount: { $sum: 1 },
          },
        },
        { $sort: { totalDonated: -1 } },
        { $limit: parseInt(limit) },
      ]);

      res.json(topDonors);
    } else if (type === 'ngos') {
      const topNGOs = await Donation.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: '$ngoId',
            totalReceived: { $sum: { $toDouble: '$settleAmount' } },
            donationCount: { $sum: 1 },
          },
        },
        { $sort: { totalReceived: -1 } },
        { $limit: parseInt(limit) },
      ]);

      const ngoIds = topNGOs.map((item) => item._id);
      const ngos = await NGO.find({ _id: { $in: ngoIds } });
      const ngoMap = new Map(ngos.map((ngo) => [ngo._id.toString(), ngo]));

      const topNGOsWithNames = topNGOs.map((item) => ({
        ...item,
        ngo: ngoMap.get(item._id.toString()) || null,
      }));

      res.json(topNGOsWithNames);
    } else {
      res.status(400).json({ error: 'Invalid type. Use "donors" or "ngos"' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;


