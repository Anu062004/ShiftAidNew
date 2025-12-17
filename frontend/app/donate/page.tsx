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
import { ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StepIndicator } from '@/components/StepIndicator';
import { Chatbot } from '@/components/Chatbot';
import { ConfidenceCue } from '@/components/ConfidenceCue';
import { SideShiftQuote, NGO, SideShiftCoin } from '@/lib/types';

export default function DonatePage() {
  // Safely use useAccount - it will work even if wallet not connected
  const { address, isConnected } = useAccount();
  const [selectedNGO, setSelectedNGO] = useState<string>('');
  const [depositCoin, setDepositCoin] = useState<string>('');
  const [settleCoin, setSettleCoin] = useState<string>('USDC.polygon');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [quote, setQuote] = useState<SideShiftQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [showConfidence, setShowConfidence] = useState(false);

  // Show confidence cue when quote is received
  useEffect(() => {
    if (quote) {
      setShowConfidence(true);
      const timer = setTimeout(() => setShowConfidence(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [quote]);

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
      setQuoteError(null);
      setQuoteLoading(true);
      
      // Use AbortController to cancel previous requests
      const abortController = new AbortController();
      let isCancelled = false;
      
      const timer = setTimeout(() => {
        getQuote(depositCoin, settleCoin, depositAmount)
          .then((data) => {
            // Only update state if this request wasn't cancelled
            if (!isCancelled) {
              setQuote(data);
              setQuoteError(null);
              setQuoteLoading(false);
            }
          })
          .catch((err: unknown) => {
            // Only update state if this request wasn't cancelled
            if (isCancelled) return;
            const error = err as { message?: string; response?: { data?: unknown } };
            console.error('Quote error full object:', err);
            console.error('Quote error type:', typeof err);
            console.error('Quote error message:', error?.message);
            console.error('Quote error response:', error?.response);
            console.error('Quote error response data:', error?.response?.data);
            
            setQuote(null);
            setQuoteLoading(false);
            
            // Extract error message properly - handle all possible error formats
            let errorMessage = 'Failed to fetch quote';
            
            try {
              // First, check if error.message contains "[object Object]" - this means the error was created with an object
              if (error?.message && typeof error.message === 'string' && error.message.includes('[object Object]')) {
                // The error message itself is "[object Object]", so we need to look elsewhere
                console.log('Error message contains [object Object], extracting from response');
              }
              
              // Try to extract from response data first (most reliable)
              if (error?.response?.data) {
                const data = error.response.data as Record<string, unknown>;
                console.log('Response data type:', typeof data);
                console.log('Response data:', data);
                
                // Check details field (backend returns error details here)
                if (data.details !== undefined && data.details !== null) {
                  console.log('Found details field:', data.details, 'type:', typeof data.details);
                  if (typeof data.details === 'string') {
                    errorMessage = data.details;
                  } else if (typeof data.details === 'object' && data.details !== null) {
                    // Try to extract message from details object
                    const detailsObj = data.details as { message?: string };
                    if (detailsObj.message && typeof detailsObj.message === 'string') {
                      errorMessage = detailsObj.message;
                    } else {
                      // Stringify the object
                      try {
                        errorMessage = JSON.stringify(data.details);
                      } catch (_e) {
                        errorMessage = 'Failed to parse error details';
                      }
                    }
                  } else {
                    errorMessage = String(data.details);
                  }
                }
                // Check error field
                else if (data.error !== undefined && data.error !== null) {
                  console.log('Found error field:', data.error, 'type:', typeof data.error);
                  if (typeof data.error === 'string') {
                    errorMessage = data.error;
                  } else if (typeof data.error === 'object' && data.error !== null) {
                    const errorObj = data.error as { message?: string };
                    if (errorObj.message && typeof errorObj.message === 'string') {
                      errorMessage = errorObj.message;
                    } else {
                      try {
                        errorMessage = JSON.stringify(data.error);
                      } catch (_e) {
                        errorMessage = 'Failed to parse error';
                      }
                    }
                  } else {
                    errorMessage = String(data.error);
                  }
                }
                // Check message field
                else if (data.message !== undefined && data.message !== null) {
                  console.log('Found message field:', data.message, 'type:', typeof data.message);
                  if (typeof data.message === 'string') {
                    errorMessage = data.message;
                  } else {
                    errorMessage = String(data.message);
                  }
                }
                // If data is a string itself
                else if (typeof data === 'string') {
                  errorMessage = data;
                }
                // If we still don't have a good message, try to stringify the whole data object
                else if (errorMessage === 'Failed to fetch quote') {
                  try {
                        const errorStr = JSON.stringify(data);
                        errorMessage = errorStr.length > 200 ? errorStr.substring(0, 200) + '...' : errorStr;
                      } catch (_e) {
                        errorMessage = 'Failed to fetch quote. Please check your inputs.';
                      }
                }
              }
              // Fallback to error.message (but check if it's not "[object Object]")
              else if (error?.message && typeof error.message === 'string') {
                const msg = error.message;
                // If message is "[object Object]", don't use it
                if (!msg.includes('[object Object]')) {
                  // Remove "Failed to fetch quote: " prefix if present
                  if (msg.startsWith('Failed to fetch quote: ')) {
                    errorMessage = msg.replace('Failed to fetch quote: ', '');
                  } else {
                    errorMessage = msg;
                  }
                }
              }
              
              // Final safety check - ensure it's a string and not "[object Object]"
              if (typeof errorMessage !== 'string') {
                errorMessage = String(errorMessage);
              }
              
              // If we still have "[object Object]", provide a generic message
              if (errorMessage.includes('[object Object]')) {
                errorMessage = 'Failed to fetch quote. Please check that both coins are supported and try again.';
              }
              
              // Limit length to avoid huge error messages
              if (errorMessage.length > 300) {
                errorMessage = errorMessage.substring(0, 300) + '...';
              }
              
              console.log('Final extracted error message:', errorMessage);
            } catch (extractError) {
              console.error('Error extracting error message:', extractError);
              errorMessage = 'Failed to fetch quote. Please check your inputs and try again.';
            }
            
            setQuoteError(errorMessage);
          });
      }, 500);
      
      // Cleanup function to cancel request if inputs change
      return () => {
        clearTimeout(timer);
        isCancelled = true;
        abortController.abort();
      };
    } else {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
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
    onError: (error: unknown) => {
      console.error('Donation creation error:', error);
      const apiError = error as { response?: { data?: { details?: string; error?: string; message?: string; hint?: string } }; message?: string };
      const errorData = apiError.response?.data || {};
      const errorMessage = errorData.details 
        || errorData.error 
        || errorData.message 
        || apiError.message 
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

  const selectedNGOData = selectedNGO ? ngos.find((ngo: NGO) => String(ngo.id || ngo._id) === selectedNGO) : null;

  // Debug: Log data loading
  useEffect(() => {
    console.log('NGOs loaded:', ngos.length, ngos);
    console.log('NGOs error:', ngosError);
    console.log('NGOs loading:', ngosLoading);
    console.log('Coins loaded:', coins.length, coins);
  }, [ngos, coins, ngosError, ngosLoading]);

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Step Indicator */}
        <StepIndicator currentStep={isConnected ? (selectedNGO ? 'donate' : 'ngo') : 'wallet'} />
        
        <div className="mb-10 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-gray-100 mb-4">Make a Donation</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Donate in any cryptocurrency, NGOs receive stablecoins instantly
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-6">
              <p className="text-center text-yellow-400 font-medium">
                Please connect your wallet to continue
              </p>
            </CardContent>
          </Card>
        )}
        {isConnected && address && (
          <Card className="mb-6 bg-green-500/10 border-green-500/30 relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                </div>
                <p className="text-center text-green-400 font-bold">
                  ✅ Wallet Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {isConnected && !address && (
          <Card className="mb-6 bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <p className="text-center text-red-400 font-medium">
                ⚠️ Wallet connected but address not available. Please reconnect your wallet.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl">
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
                    <span className="text-sm text-gray-400">Loading NGOs...</span>
                  </div>
                ) : ngosError ? (
                  <div className="h-auto px-3 py-2 border border-red-500/30 rounded-md bg-red-500/10">
                    <span className="text-sm text-red-400 block mb-1">
                      <strong>Error loading NGOs:</strong> {ngosError instanceof Error ? ngosError.message : 'Unable to connect to backend'}
                    </span>
                    <span className="text-xs text-red-300 block">
                      Please ensure the backend API is running and accessible at {process.env.NEXT_PUBLIC_API_URL || 'the configured URL'}.
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
                        <div className="px-2 py-1.5 text-sm text-gray-400">No NGOs available. Please seed the database.</div>
                      ) : (
                        ngos.filter((ngo: NGO) => (ngo.id || ngo._id) && ngo.name).map((ngo: NGO) => {
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
                  <p className="mt-2 text-sm text-gray-400">{selectedNGOData.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cryptocurrency to Donate *</label>
                {coinsLoading ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-400">Loading coins...</span>
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
                        <div className="px-2 py-1.5 text-sm text-gray-400">No coins available</div>
                      ) : (
                        coins
                          .filter((coin: SideShiftCoin) => coin && coin.id && String(coin.id).trim() !== '')
                          .map((coin: SideShiftCoin) => (
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
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-sm text-yellow-400">
                  <strong>⚠️ Warning:</strong> You cannot swap the same coin. Please select a different cryptocurrency to donate.
                </div>
              )}
              <Button
                onClick={(e) => {
                  // Ripple effect
                  const button = e.currentTarget;
                  const ripple = document.createElement('span');
                  const rect = button.getBoundingClientRect();
                  const size = Math.max(rect.width, rect.height);
                  const x = e.clientX - rect.left - size / 2;
                  const y = e.clientY - rect.top - size / 2;
                  ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;`;
                  button.appendChild(ripple);
                  setTimeout(() => ripple.remove(), 600);
                  handleDonate();
                }}
                disabled={!isConnected || createDonationMutation.isPending || !depositAmount || !depositCoin || !selectedNGO || depositCoin === settleCoin}
                className="w-full relative overflow-hidden"
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
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-400">
                  <strong>Error:</strong> {(() => {
                    const error = createDonationMutation.error as { response?: { data?: { details?: string; error?: string; hint?: string } }; message?: string } | undefined;
                    return error?.response?.data?.details 
                      || error?.response?.data?.error 
                      || error?.message 
                      || 'Failed to create donation';
                  })()}
                  {(() => {
                    const error = createDonationMutation.error as { response?: { data?: { hint?: string } } } | undefined;
                    return error?.response?.data?.hint && (
                      <p className="mt-2 text-red-300">{error.response.data.hint}</p>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Quote Preview */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Quote Preview</CardTitle>
              <CardDescription>Real-time conversion rate</CardDescription>
            </CardHeader>
            <CardContent>
              {quoteError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                  <p className="text-sm font-bold text-red-400 mb-1">Error loading quote</p>
                  <p className="text-sm text-red-300">{quoteError}</p>
                  {depositCoin === settleCoin && (
                    <p className="text-xs text-red-400 mt-2">
                      Note: You cannot swap the same coin. Please select different coins.
                    </p>
                  )}
                </div>
              ) : quote ? (
                <div className="relative">
                  {/* Confidence Cue */}
                  {showConfidence && (
                    <div className="mb-4 flex justify-center">
                      <ConfidenceCue 
                        message="Funds go directly to NGO wallet • You stay in control"
                        icon="shield"
                        show={showConfidence}
                      />
                    </div>
                  )}
                <div className="space-y-4">
                  <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">You Send</span>
                      <span className="font-bold text-gray-100">
                        {formatAmount(quote.depositAmount)} {quote.depositCoin}
                      </span>
                    </div>
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">NGO Receives</span>
                      <span className="font-bold text-green-400">
                        {formatAmount(quote.settleAmount)} {quote.settleCoin}
                      </span>
                    </div>
                  </div>

                  {quote.rate && (
                    <div className="text-sm text-gray-400">
                      <p>Rate: 1 {quote.depositCoin} = {formatAmount(quote.rate)} {quote.settleCoin}</p>
                    </div>
                  )}

                  {quote.fees && (
                    <div className="text-xs text-gray-500">
                      <p>Estimated fees: {formatAmount(quote.fees)} {quote.settleCoin}</p>
                    </div>
                  )}
                </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {quoteLoading && depositCoin && depositAmount ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-400" />
                  ) : (
                    <p>Fill in the form to see quote</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}


