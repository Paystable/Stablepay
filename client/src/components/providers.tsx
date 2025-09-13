
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import { config, ONCHAINKIT_CONFIG } from '@/lib/wagmi';
import { queryClient } from '@/lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={ONCHAINKIT_CONFIG.apiKey}
          chain={ONCHAINKIT_CONFIG.chain}
          schemaId={ONCHAINKIT_CONFIG.schemaId}
          paymaster={ONCHAINKIT_CONFIG.paymaster}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
