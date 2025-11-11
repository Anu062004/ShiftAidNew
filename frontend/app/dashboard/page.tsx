'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats, getDonations } from '@/lib/api';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';
import { Loader2, TrendingUp, Users, Heart, DollarSign } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const donations = donationsData?.donations || [];
  const weeklyStats = stats?.weeklyStats || { donations: 0, amount: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDonations || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmount(stats?.totalAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">In stablecoins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Donations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyStats.donations}</div>
              <p className="text-xs text-muted-foreground">
                {formatAmount(weeklyStats.amount)} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.topDonors?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active contributors</p>
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
                  <p className="text-center text-gray-500 py-8">No donations yet</p>
                ) : (
                  donations.map((donation: any) => (
                    <div key={donation._id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {formatAmount(donation.depositAmount)} {donation.depositCoin}
                          </p>
                          <p className="text-sm text-gray-600">
                            → {formatAmount(donation.settleAmount)} {donation.settleCoin}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            donation.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {donation.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Donor: {formatAddress(donation.donorAddress)}</p>
                        <p>NGO: {donation.ngoId?.name || 'Unknown'}</p>
                        <p>{formatDate(donation.createdAt)}</p>
                      </div>
                      {donation.settleTxHash && (
                        <Link
                          href={`https://amoy.polygonscan.com/tx/${donation.settleTxHash}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline"
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
                  <p className="text-center text-gray-500 py-8">No donors yet</p>
                ) : (
                  stats.topDonors.map((donor: any, index: number) => (
                    <div key={donor._id} className="flex justify-between items-center border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{formatAddress(donor._id)}</p>
                          <p className="text-xs text-gray-600">{donor.donationCount} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatAmount(donor.totalDonated)}
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
                {stats.topNGOs.map((item: any, index: number) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                      <div>
                        <p className="font-semibold">{item.ngo?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-600">{item.ngo?.category}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatAmount(item.totalReceived)}
                    </p>
                    <p className="text-xs text-gray-600">{item.donationCount} donations</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


