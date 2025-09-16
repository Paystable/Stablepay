
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Stable Pay',
    appLogoUrl: window.location.origin + '/stablepay-logo.png',
      reloadOnDisconnect: false,
    }),
    injected()
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org', {
      timeout: 30000,
      retryCount: 3,
    }),
  },
})

// OnchainKit configuration
export const ONCHAINKIT_CONFIG = {
  apiKey: import.meta.env.VITE_COINBASE_API_KEY || '55a219f0-5f88-4931-818a-34bd7d74eff8',
  chain: base,
  schemaId: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
  paymaster: `${import.meta.env.VITE_PAYMASTER_URL || 'https://api.developer.coinbase.com/rpc/v1/base/yHLH6AHHYTuJcz4ByF9jNN0tWQkHZhSO'}`,
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
