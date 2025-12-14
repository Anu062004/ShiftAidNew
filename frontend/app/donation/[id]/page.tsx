'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDonation } from '@/lib/api';
import { formatAmount, formatAddress, formatDate } from '@/lib/utils';
import { Loader2, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';
import Link from 'next/link';

import { LucideIcon } from 'lucide-react';

const statusConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30', label: 'Pending Deposit' },
  deposit_received: { icon: Clock, color: 'text-cyan-400 bg-cyan-500/20 border border-cyan-500/30', label: 'Deposit Received' },
  swapping: { icon: Clock, color: 'text-violet-400 bg-violet-500/20 border border-violet-500/30', label: 'Swapping' },
  completed: { icon: CheckCircle2, color: 'text-green-400 bg-green-500/20 border border-green-500/30', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-400 bg-red-500/20 border border-red-500/30', label: 'Failed' },
  expired: { icon: XCircle, color: 'text-gray-400 bg-gray-500/20 border border-gray-500/30', label: 'Expired' },
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
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error) {
    const apiError = error as { response?: { data?: { error?: string } }; message?: string };
    const errorMessage = apiError?.response?.data?.error 
      || apiError?.message 
      || 'Failed to load donation';
    return (
      <div className="min-h-screen bg-[#0B0E14]">
        <Navbar />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg rounded-2xl max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-red-400 mb-2 font-bold">Error loading donation</p>
              <p className="text-center text-gray-400 text-sm">{errorMessage}</p>
              <Link href="/dashboard" className="text-center text-violet-400 hover:text-violet-300 hover:underline mt-4 block font-medium">
                ← Back to Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-[#0B0E14]">
        <Navbar />
        <div className="container mx-auto px-6 py-16 flex items-center justify-center">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg rounded-2xl max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-gray-400 mb-4 font-medium">Donation not found</p>
              <p className="text-center text-gray-500 text-sm mb-4">ID: {donationId}</p>
              <Link href="/dashboard" className="text-center text-violet-400 hover:text-violet-300 hover:underline block font-medium">
                ← Back to Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[donation.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 hover:underline mb-6 inline-block font-medium">
          ← Back to Dashboard
        </Link>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-lg rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Donation Status</CardTitle>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color}`}>
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{statusInfo.label}</span>
              </div>
            </div>
            <CardDescription>Order ID: {donation.sideshiftOrderId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Conversion Details */}
            <div className="bg-violet-500/10 border border-violet-500/20 p-6 rounded-lg">
              <h3 className="font-bold mb-4 text-gray-100">Conversion Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">You Send:</span>
                  <span className="font-bold text-gray-100">
                    {formatAmount(donation.depositAmount)} {donation.depositCoin}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="text-2xl text-violet-400">→</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NGO Receives:</span>
                  <span className="font-bold text-green-400">
                    {formatAmount(donation.settleAmount)} {donation.settleCoin}
                  </span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div>
              <h3 className="font-bold mb-3 text-gray-100">Addresses</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Deposit Address:</span>
                  <div className="font-mono bg-white/5 border border-white/10 p-2 rounded mt-1 break-all text-gray-300">
                    {donation.depositAddress}
                  </div>
                  {donation.status === 'pending' && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Send {formatAmount(donation.depositAmount)} {donation.depositCoin} to this address
                    </p>
                  )}
                </div>
                <div>
                  <span className="text-gray-400">NGO Wallet:</span>
                  <div className="font-mono bg-white/5 border border-white/10 p-2 rounded mt-1 break-all text-gray-300">
                    {donation.settleAddress}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Donor Address:</span>
                  <div className="font-mono bg-white/5 border border-white/10 p-2 rounded mt-1 text-gray-300">
                    {formatAddress(donation.donorAddress)}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Hashes */}
            {(donation.depositTxHash || donation.settleTxHash || donation.onChainTxHash) && (
              <div>
                <h3 className="font-bold mb-3 text-gray-100">Transaction Hashes</h3>
                <div className="space-y-2 text-sm">
                  {donation.depositTxHash && (
                    <div>
                      <span className="text-gray-400">Deposit TX:</span>
                      <a
                        href={`https://blockchair.com/bitcoin/transaction/${donation.depositTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-violet-400 hover:text-violet-300 hover:underline ml-2 flex items-center gap-1"
                      >
                        {donation.depositTxHash.slice(0, 20)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {donation.settleTxHash && (
                    <div>
                      <span className="text-gray-400">Settle TX:</span>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${donation.settleTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-violet-400 hover:text-violet-300 hover:underline ml-2 flex items-center gap-1"
                      >
                        {donation.settleTxHash.slice(0, 20)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {donation.onChainTxHash && (
                    <div>
                      <span className="text-gray-400">On-Chain Log TX:</span>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${donation.onChainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-violet-400 hover:text-violet-300 hover:underline ml-2 flex items-center gap-1"
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
                <h3 className="font-bold mb-3 text-gray-100">NGO Information</h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded">
                  {typeof donation.ngoId === 'object' && donation.ngoId.name ? (
                    <>
                      <p className="font-bold text-gray-100">{donation.ngoId.name}</p>
                      <p className="text-sm text-gray-400">{donation.ngoId.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Category: {donation.ngoId.category}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">NGO ID: {donation.ngoId}</p>
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
      <Chatbot />
    </div>
  );
}


