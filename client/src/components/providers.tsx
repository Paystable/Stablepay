
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import { config } from '@/lib/wagmi';
import { queryClient } from '@/lib/queryClient';
import { PerformanceMonitor } from "@/components/performance-monitor";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <PerformanceMonitor />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
