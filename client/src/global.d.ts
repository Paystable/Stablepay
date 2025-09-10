declare interface Window {
  ethereum?: any;
}

declare global {
  interface Window {
    CB_ONRAMP_TOKEN?: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_COINBASE_APP_ID?: string;
  readonly VITE_COINBASE_PROJECT_ID?: string;
  readonly VITE_COINBASE_API_KEY?: string;
  readonly VITE_PAYMASTER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}