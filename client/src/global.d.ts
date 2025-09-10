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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}