'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, useMemo } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create config only on client side, after mount
  const config = useMemo(() => {
    if (typeof window === 'undefined' || !mounted) {
      return null;
    }
    
    return createConfig({
      chains: [polygonAmoy],
      connectors: [injected()],
      transports: {
        [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology'),
      },
    });
  }, [mounted]);

  // Always render WagmiProvider, but only with config after mount
  // This prevents the "must be used within WagmiProvider" error
  if (!mounted || !config) {
    // Create a minimal config for SSR/hydration
    const fallbackConfig = createConfig({
      chains: [polygonAmoy],
      connectors: [],
      transports: {
        [polygonAmoy.id]: http(),
      },
    });

    return (
      <WagmiProvider config={fallbackConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

