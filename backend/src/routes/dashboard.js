import express from 'express';
import { Donations, NGOs } from '../db/adapter.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const sb = (await import('../db/supabase.js')).getSupabase();

    // Get completed donations
    const { data: completedDonations, error: donationsError } = await sb
      .from('donations')
      .select('*')
      .eq('status', 'completed');

    if (donationsError) throw donationsError;

    const totalDonations = completedDonations?.length || 0;
    const totalAmount = completedDonations?.reduce((sum, d) => sum + parseFloat(d.settleAmount || 0), 0) || 0;

    // Top donors
    const donorMap = new Map();
    completedDonations?.forEach((d) => {
      const addr = d.donorAddress?.toLowerCase();
      if (!addr) return;
      const existing = donorMap.get(addr) || { donorAddress: addr, totalDonated: 0, donationCount: 0 };
      existing.totalDonated += parseFloat(d.settleAmount || 0);
      existing.donationCount += 1;
      donorMap.set(addr, existing);
    });
    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 10);

    // Top NGOs
    const ngoMap = new Map();
    completedDonations?.forEach((d) => {
      const ngoId = d.ngoId;
      if (!ngoId) return;
      const existing = ngoMap.get(ngoId) || { ngoId, totalReceived: 0, donationCount: 0 };
      existing.totalReceived += parseFloat(d.settleAmount || 0);
      existing.donationCount += 1;
      ngoMap.set(ngoId, existing);
    });
    const topNGOsData = Array.from(ngoMap.values())
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, 10);

    // Populate NGO names
    const ngoIds = topNGOsData.map((item) => item.ngoId);
    const ngos = await Promise.all(ngoIds.map((id) => NGOs.getById(id)));
    const ngoMapById = new Map(ngos.filter(Boolean).map((ngo) => [ngo.id, ngo]));

    const topNGOsWithNames = topNGOsData.map((item) => ({
      ...item,
      ngo: ngoMapById.get(item.ngoId) || null,
    }));

    // Recent donations
    const recentDonations = completedDonations
      ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20) || [];

    // Populate NGO info for recent donations
    const recentNgoIds = [...new Set(recentDonations.map((d) => d.ngoId).filter(Boolean))];
    const recentNgos = await Promise.all(recentNgoIds.map((id) => NGOs.getById(id)));
    const recentNgoMap = new Map(recentNgos.filter(Boolean).map((ngo) => [ngo.id, ngo]));

    const recentDonationsWithNGOs = recentDonations.map((d) => ({
      ...d,
      ngoId: recentNgoMap.get(d.ngoId) || null,
    }));

    // Weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyDonations = completedDonations?.filter(
      (d) => new Date(d.createdAt) >= oneWeekAgo
    ) || [];

    res.json({
      totalDonations,
      totalAmount,
      topDonors,
      topNGOs: topNGOsWithNames,
      recentDonations: recentDonationsWithNGOs,
      weeklyStats: {
        donations: weeklyDonations.length,
        amount: weeklyDonations.reduce((sum, d) => sum + parseFloat(d.settleAmount || 0), 0),
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

    const sb = (await import('../db/supabase.js')).getSupabase();
    const { data: completedDonations, error: donationsError } = await sb
      .from('donations')
      .select('*')
      .eq('status', 'completed');

    if (donationsError) throw donationsError;

    if (type === 'donors') {
      const donorMap = new Map();
      completedDonations?.forEach((d) => {
        const addr = d.donorAddress?.toLowerCase();
        if (!addr) return;
        const existing = donorMap.get(addr) || { _id: addr, totalDonated: 0, donationCount: 0 };
        existing.totalDonated += parseFloat(d.settleAmount || 0);
        existing.donationCount += 1;
        donorMap.set(addr, existing);
      });

      const topDonors = Array.from(donorMap.values())
        .sort((a, b) => b.totalDonated - a.totalDonated)
        .slice(0, parseInt(limit));

      res.json(topDonors);
    } else if (type === 'ngos') {
      const ngoMap = new Map();
      completedDonations?.forEach((d) => {
        const ngoId = d.ngoId;
        if (!ngoId) return;
        const existing = ngoMap.get(ngoId) || { _id: ngoId, totalReceived: 0, donationCount: 0 };
        existing.totalReceived += parseFloat(d.settleAmount || 0);
        existing.donationCount += 1;
        ngoMap.set(ngoId, existing);
      });

      const topNGOsData = Array.from(ngoMap.values())
        .sort((a, b) => b.totalReceived - a.totalReceived)
        .slice(0, parseInt(limit));

      const ngoIds = topNGOsData.map((item) => item._id);
      const ngos = await Promise.all(ngoIds.map((id) => NGOs.getById(id)));
      const ngoMapById = new Map(ngos.filter(Boolean).map((ngo) => [ngo.id, ngo]));

      const topNGOsWithNames = topNGOsData.map((item) => ({
        ...item,
        ngo: ngoMapById.get(item._id) || null,
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
