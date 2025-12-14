'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WalletConnectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showAddress?: boolean;
}

export function WalletConnectButton({ 
  showAddress = true 
}: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="w-32 h-10" />; // Placeholder
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {showAddress && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-violet-500/30 rounded-full shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-sm text-gray-200 font-medium">{formatAddress(address)}</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="lg"
          onClick={() => disconnect()}
          className="h-12 w-12 text-gray-400 hover:text-gray-200 rounded-full hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Check if any connectors are available
  if (connectors.length === 0) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          window.open('https://metamask.io/download/', '_blank');
        }}
        className="h-12 px-6 rounded-full border-2 border-gray-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all duration-200 text-gray-300 font-semibold text-base"
      >
        <Wallet className="h-5 w-5 mr-2" />
        Install MetaMask
      </Button>
    );
  }

  // Use the first available connector (usually MetaMask)
  const primaryConnector = connectors[0];

  return (
    <div className="flex flex-col gap-2">
      {connectError && (
        <div className="text-xs text-red-400 bg-red-500/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-red-500/30">
          {connectError.message || 'Connection failed. Please try again.'}
        </div>
      )}
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          if (primaryConnector) {
            try {
              connect({ connector: primaryConnector });
            } catch (error: unknown) {
                console.error('Connection error:', error);
                const errorMessage = (error as { message?: string })?.message || 'Failed to connect wallet. Please make sure MetaMask is installed and unlocked.';
                alert(errorMessage);
            }
          }
        }}
        disabled={isPending || !primaryConnector}
        className="h-12 px-6 rounded-full border-2 border-gray-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all duration-200 text-gray-300 font-semibold text-base"
      >
        <Wallet className="h-5 w-5 mr-2" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}
