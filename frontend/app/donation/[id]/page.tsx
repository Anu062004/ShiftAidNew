'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDonation } from '@/lib/api';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';
import { Loader2, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-100', label: 'Pending Deposit' },
  deposit_received: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'Deposit Received' },
  swapping: { icon: Clock, color: 'text-purple-600 bg-purple-100', label: 'Swapping' },
  completed: { icon: CheckCircle2, color: 'text-green-600 bg-green-100', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Failed' },
  expired: { icon: XCircle, color: 'text-gray-600 bg-gray-100', label: 'Expired' },
};

export default function DonationStatusPage() {
  const params = useParams();
  const donationId = params.id as string;

  const { data: donation, isLoading, error } = useQuery({
    queryKey: ['donation', donationId],
    queryFn: () => getDonation(donationId),
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.error 
      || (error as any)?.message 
      || 'Failed to load donation';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-2">Error loading donation</p>
            <p className="text-center text-gray-500 text-sm">{errorMessage}</p>
            <Link href="/dashboard" className="text-center text-blue-600 hover:underline mt-4 block">
              ← Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 mb-4">Donation not found</p>
            <p className="text-center text-gray-400 text-sm mb-4">ID: {donationId}</p>
            <Link href="/dashboard" className="text-center text-blue-600 hover:underline block">
              ← Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[donation.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Donation Status</CardTitle>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{statusInfo.label}</span>
              </div>
            </div>
            <CardDescription>Order ID: {donation.sideshiftOrderId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conversion Details */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Conversion Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">You Send:</span>
                  <span className="font-semibold">
                    {formatAmount(donation.depositAmount)} {donation.depositCoin}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="text-2xl">→</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NGO Receives:</span>
                  <span className="font-semibold text-green-600">
                    {formatAmount(donation.settleAmount)} {donation.settleCoin}
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div>
              <h3 className="font-semibold mb-3">Addresses</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Deposit Address:</span>
                  <div className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {donation.depositAddress}
                  </div>
                  {donation.status === 'pending' && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Send {formatAmount(donation.depositAmount)} {donation.depositCoin} to this address
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">NGO Wallet:</span>
                  <div className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {donation.settleAddress}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Donor Address:</span>
                  <div className="font-mono bg-gray-100 p-2 rounded mt-1">
                    {formatAddress(donation.donorAddress)}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Hashes */}
            {(donation.depositTxHash || donation.settleTxHash || donation.onChainTxHash) && (
              <div>
                <h3 className="font-semibold mb-3">Transaction Hashes</h3>
                <div className="space-y-2 text-sm">
                  {donation.depositTxHash && (
                    <div>
                      <span className="text-gray-600">Deposit TX:</span>
                      <a
                        href={`https://blockchair.com/bitcoin/transaction/${donation.depositTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:underline ml-2 flex items-center gap-1"
                      >
                        {donation.depositTxHash.slice(0, 20)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {donation.settleTxHash && (
                    <div>
                      <span className="text-gray-600">Settle TX:</span>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${donation.settleTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:underline ml-2 flex items-center gap-1"
                      >
                        {donation.settleTxHash.slice(0, 20)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {donation.onChainTxHash && (
                    <div>
                      <span className="text-gray-600">On-Chain Log TX:</span>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${donation.onChainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-blue-600 hover:underline ml-2 flex items-center gap-1"
                      >
                        {donation.onChainTxHash.slice(0, 20)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NGO Info */}
            {donation.ngoId && (
              <div>
                <h3 className="font-semibold mb-3">NGO Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {typeof donation.ngoId === 'object' && donation.ngoId.name ? (
                    <>
                      <p className="font-semibold">{donation.ngoId.name}</p>
                      <p className="text-sm text-gray-600">{donation.ngoId.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Category: {donation.ngoId.category}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">NGO ID: {donation.ngoId}</p>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Created: {formatDate(donation.createdAt)}</p>
              {donation.updatedAt && <p>Last Updated: {formatDate(donation.updatedAt)}</p>}
            </div>

            {/* SideShift Order Link */}
            <div className="pt-4 border-t">
              <a
                href={`https://sideshift.ai/orders/${donation.sideshiftOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                View on SideShift <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


