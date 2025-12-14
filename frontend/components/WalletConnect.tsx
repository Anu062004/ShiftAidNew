'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export function WalletConnect() {
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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-md">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  // Check if any connectors are available
  if (connectors.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.open('https://metamask.io/download/', '_blank');
          }}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Install MetaMask
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectError && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {connectError.message || 'Connection failed. Please try again.'}
        </div>
      )}
      <div className="flex gap-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => {
              try {
                connect({ connector });
              } catch (error: unknown) {
                console.error('Connection error:', error);
                const errorMessage = (error as { message?: string })?.message || 'Failed to connect wallet. Please make sure MetaMask is installed and unlocked.';
                alert(errorMessage);
              }
            }}
            disabled={isPending}
            size="sm"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isPending ? 'Connecting...' : `Connect ${connector.name || 'Wallet'}`}
          </Button>
        ))}
      </div>
    </div>
  );
}


