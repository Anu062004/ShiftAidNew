'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNGOs, getCoins, getQuote, createDonation } from '@/lib/api';
import { formatAmount } from '@/lib/utils';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DonatePage() {
  // Safely use useAccount - it will work even if wallet not connected
  const { address, isConnected } = useAccount();
  const [selectedNGO, setSelectedNGO] = useState<string>('');
  const [depositCoin, setDepositCoin] = useState<string>('');
  const [settleCoin, setSettleCoin] = useState<string>('USDC.polygon');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [quote, setQuote] = useState<any>(null);

  // Fetch NGOs
  const { data: ngos = [], isLoading: ngosLoading, error: ngosError } = useQuery({
    queryKey: ['ngos', { verified: true }],
    queryFn: () => getNGOs({ verified: true }),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch coins
  const { data: coins = [], isLoading: coinsLoading } = useQuery({
    queryKey: ['coins'],
    queryFn: getCoins,
  });

  // Fetch quote when inputs change
  useEffect(() => {
    if (depositCoin && settleCoin && depositAmount) {
      const timer = setTimeout(() => {
        getQuote(depositCoin, settleCoin, depositAmount)
          .then(setQuote)
          .catch((err) => {
            console.error('Quote error:', err);
            setQuote(null);
          });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setQuote(null);
    }
  }, [depositCoin, settleCoin, depositAmount]);

  // Create donation mutation
  const createDonationMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: (data) => {
      // Redirect to donation status page
      const donationId = data.donation?.id || data.donation?._id;
      if (donationId) {
        window.location.href = `/donation/${donationId}`;
      } else {
        console.error('Donation ID not found in response:', data);
        alert('Donation created but could not redirect. Please check your dashboard.');
      }
    },
    onError: (error: any) => {
      console.error('Donation creation error:', error);
      const errorData = error.response?.data || {};
      const errorMessage = errorData.details 
        || errorData.error 
        || errorData.message 
        || error.message 
        || 'Failed to create donation. Please try again.';
      const hint = errorData.hint || '';
      alert(`Error: ${errorMessage}${hint ? `\n\n${hint}` : ''}`);
    },
  });

  const handleDonate = () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate wallet address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert('Invalid wallet address. Please reconnect your wallet.');
      return;
    }

    if (!selectedNGO || !depositCoin || !depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    // Validate that deposit and settle coins are different
    if (depositCoin === settleCoin) {
      alert('Error: Cannot swap the same coin.\n\nPlease select a different cryptocurrency to donate, or the NGO should receive a different coin.');
      return;
    }

    console.log('Creating donation with:', {
      ngoId: selectedNGO,
      depositCoin,
      settleCoin,
      donorAddress: address,
      depositAmount,
      isConnected,
      addressLength: address?.length,
    });

    createDonationMutation.mutate({
      ngoId: selectedNGO,
      depositCoin,
      settleCoin,
      donorAddress: address.toLowerCase(), // Ensure lowercase for consistency
      depositAmount,
    });
  };

  const selectedNGOData = selectedNGO ? ngos.find((ngo: any) => String(ngo.id || ngo._id) === selectedNGO) : null;

  // Debug: Log data loading
  useEffect(() => {
    console.log('NGOs loaded:', ngos.length, ngos);
    console.log('NGOs error:', ngosError);
    console.log('NGOs loading:', ngosLoading);
    console.log('Coins loaded:', coins.length, coins);
  }, [ngos, coins, ngosError, ngosLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Make a Donation</h1>
          <p className="text-lg text-gray-600">
            Donate in any cryptocurrency, NGOs receive stablecoins instantly
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-center text-yellow-800">
                Please connect your wallet to continue
              </p>
            </CardContent>
          </Card>
        )}
        {isConnected && address && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-center text-green-800">
                ✅ Wallet Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </p>
            </CardContent>
          </Card>
        )}
        {isConnected && !address && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-center text-red-800">
                ⚠️ Wallet connected but address not available. Please reconnect your wallet.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>Select NGO and cryptocurrency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select NGO *</label>
                {ngosLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading NGOs...</span>
                  </div>
                ) : ngosError ? (
                  <div className="h-auto px-3 py-2 border border-red-300 rounded-md bg-red-50">
                    <span className="text-sm text-red-600 block mb-1">
                      <strong>Error loading NGOs:</strong> {ngosError instanceof Error ? ngosError.message : 'Network error'}
                    </span>
                    <span className="text-xs text-red-500 block">
                      Make sure the backend server is running on port 3001. Check the terminal for backend status.
                    </span>
                  </div>
                ) : (
                  <Select 
                    value={selectedNGO || undefined} 
                    onValueChange={(value) => {
                      console.log('NGO selected:', value);
                      setSelectedNGO(value);
                    }}
                    disabled={ngos.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={ngos.length === 0 ? "No NGOs available" : "Choose an NGO"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ngos.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No NGOs available. Please seed the database.</div>
                      ) : (
                        ngos.filter((ngo: any) => (ngo.id || ngo._id) && ngo.name).map((ngo: any) => {
                          const ngoId = ngo.id || ngo._id;
                          return (
                            <SelectItem key={String(ngoId)} value={String(ngoId)}>
                              {ngo.name} - {ngo.category || 'NGO'}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                )}
                {selectedNGOData && (
                  <p className="mt-2 text-sm text-gray-600">{selectedNGOData.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cryptocurrency to Donate *</label>
                {coinsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading coins...</span>
                  </div>
                ) : (
                  <Select 
                    value={depositCoin || undefined} 
                    onValueChange={(value) => {
                      console.log('Coin selected:', value);
                      setDepositCoin(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select crypto" />
                    </SelectTrigger>
                    <SelectContent>
                      {coins.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">No coins available</div>
                      ) : (
                        coins
                          .filter((coin: any) => coin && coin.id && String(coin.id).trim() !== '')
                          .map((coin: any) => (
                            <SelectItem key={String(coin.id)} value={String(coin.id)}>
                              {coin.name || coin.id} ({coin.id})
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount to Donate *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Receive Coin</label>
                <Select value={settleCoin} onValueChange={setSettleCoin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC.polygon">USDC (Polygon)</SelectItem>
                    <SelectItem value="USDT.polygon">USDT (Polygon)</SelectItem>
                    <SelectItem value="DAI.polygon">DAI (Polygon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {depositCoin === settleCoin && depositCoin && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  <strong>⚠️ Warning:</strong> You cannot swap the same coin. Please select a different cryptocurrency to donate.
                </div>
              )}
              <Button
                onClick={handleDonate}
                disabled={!isConnected || createDonationMutation.isPending || !depositAmount || !depositCoin || !selectedNGO || depositCoin === settleCoin}
                className="w-full"
                size="lg"
              >
                {createDonationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    Create Donation Order <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              {createDonationMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  <strong>Error:</strong> {createDonationMutation.error?.response?.data?.details 
                    || createDonationMutation.error?.response?.data?.error 
                    || createDonationMutation.error?.message 
                    || 'Failed to create donation'}
                  {createDonationMutation.error?.response?.data?.hint && (
                    <p className="mt-2 text-red-700">{createDonationMutation.error.response.data.hint}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Quote Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Preview</CardTitle>
              <CardDescription>Real-time conversion rate</CardDescription>
            </CardHeader>
            <CardContent>
              {quote ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">You Send</span>
                      <span className="font-semibold">
                        {formatAmount(quote.depositAmount)} {quote.depositCoin}
                      </span>
                    </div>
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">NGO Receives</span>
                      <span className="font-semibold text-green-600">
                        {formatAmount(quote.settleAmount)} {quote.settleCoin}
                      </span>
                    </div>
                  </div>

                  {quote.rate && (
                    <div className="text-sm text-gray-600">
                      <p>Rate: 1 {quote.depositCoin} = {formatAmount(quote.rate)} {quote.settleCoin}</p>
                    </div>
                  )}

                  {quote.fees && (
                    <div className="text-xs text-gray-500">
                      <p>Estimated fees: {formatAmount(quote.fees)} {quote.settleCoin}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {depositCoin && depositAmount ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : (
                    <p>Fill in the form to see quote</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


