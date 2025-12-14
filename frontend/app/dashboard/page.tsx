'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats, getDonations } from '@/lib/api';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';
import { Donation, LeaderboardEntry } from '@/lib/types';
import { Loader2, TrendingUp, Users, Heart, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ['donations', { page: 1, limit: 20 }],
    queryFn: () => getDonations({ page: 1, limit: 20 }),
  });

  if (statsLoading || donationsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400" />
      </div>
    );
  }

  const donations = donationsData?.donations || [];
  const weeklyStats = stats?.weeklyStats || { donations: 0, amount: 0 };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14]">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-gray-100 mb-12 text-center">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Donations</CardTitle>
              <Heart className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalDonations || 0}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Amount</CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: 'var(--info)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatAmount(stats?.totalAmount || 0)}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>In stablecoins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Weekly Donations</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--success)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{weeklyStats.donations}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatAmount(weeklyStats.amount)} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Top Donors</CardTitle>
              <Users className="h-4 w-4" style={{ color: 'var(--info)' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.topDonors?.length || 0}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active contributors</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Latest donation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donations.length === 0 ? (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No donations yet</p>
                ) : (
                  donations.map((donation: Donation) => (
                    <div key={donation._id} className="border-b pb-4 last:border-0" style={{ borderColor: 'var(--border-medium)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {formatAmount(donation.depositAmount)} {donation.depositCoin}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            → {formatAmount(donation.settleAmount)} {donation.settleCoin}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold border"
                          style={{
                            backgroundColor: donation.status === 'completed' 
                              ? 'var(--success-bg)' 
                              : donation.status === 'pending'
                              ? 'var(--warning-bg)'
                              : 'var(--bg-muted)',
                            color: donation.status === 'completed'
                              ? 'var(--success)'
                              : donation.status === 'pending'
                              ? 'var(--warning)'
                              : 'var(--text-secondary)',
                            borderColor: donation.status === 'completed'
                              ? 'var(--success)'
                              : donation.status === 'pending'
                              ? 'var(--warning)'
                              : 'var(--border-medium)',
                          }}
                        >
                          {donation.status}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <p>Donor: {formatAddress(donation.donorAddress)}</p>
                        <p>NGO: {typeof donation.ngoId === 'object' ? donation.ngoId.name : 'Unknown'}</p>
                        <p>{donation.createdAt ? formatDate(donation.createdAt) : 'N/A'}</p>
                      </div>
                      {donation.settleTxHash && (
                        <Link
                          href={`https://amoy.polygonscan.com/tx/${donation.settleTxHash}`}
                          target="_blank"
                          className="text-xs hover:underline"
                          style={{ color: 'var(--brand-primary)' }}
                        >
                          View on Explorer
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Donors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Most generous contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!stats?.topDonors || stats.topDonors.length === 0 ? (
                  <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No donors yet</p>
                ) : (
                  stats.topDonors.map((donor: LeaderboardEntry, index: number) => (
                    <div key={donor._id || donor.address || index} className="flex justify-between items-center border-b pb-4 last:border-0" style={{ borderColor: 'var(--border-medium)' }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: 'var(--brand-accent)',
                            borderColor: 'var(--brand-primary)',
                            color: 'var(--brand-primary)',
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatAddress(donor._id || donor.address || '')}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{donor.donationCount} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: 'var(--success)' }}>
                          {formatAmount(donor.totalDonated || donor.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top NGOs */}
        {stats?.topNGOs && stats.topNGOs.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top NGOs</CardTitle>
              <CardDescription>Most supported organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.topNGOs.map((item: LeaderboardEntry, index: number) => (
                  <div 
                    key={item._id || item.ngoId || index} 
                    className="border rounded-lg p-4"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{index + 1}</span>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.ngo?.name || item.name || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.ngo?.category}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                      {formatAmount(item.totalReceived || item.totalAmount)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.donationCount} donations</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Chatbot />
    </div>
  );
}


