// API Configuration for AWS Amplify deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://zz0i3vbr6b.execute-api.us-east-1.amazonaws.com/prod'
  : 'http://localhost:3000';

// HTTPS Static Server URL for production
const STATIC_SERVER_URL = 'https://7ywcv0e6u6.execute-api.us-east-1.amazonaws.com/prod';

export const API_ENDPOINTS = {
  EARLY_ACCESS: {
    SUBMIT: `${API_BASE_URL}/api/early-access/submit`,
    SUBMISSIONS: `${API_BASE_URL}/api/early-access/submissions`,
    STATS: `${API_BASE_URL}/api/early-access/stats`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/early-access/submissions/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/early-access/submissions/${id}`,
  },
  POOL: {
    DATA: `${API_BASE_URL}/api/pool/data`,
    WALLET: (address: string) => `${API_BASE_URL}/api/pool/wallet/${address}`,
  },
  WALLET: {
    BALANCES: (address: string) => `${API_BASE_URL}/api/wallet/${address}/balances`,
    TRANSACTIONS: (address: string) => `${API_BASE_URL}/api/wallet/${address}/transactions`,
  },
  VAULT: {
    DEPOSIT: (address: string) => `${API_BASE_URL}/api/vault/${address}/deposit`,
  },
  METRICS: {
    STABLEPAY: (address: string) => `${API_BASE_URL}/api/stablepay/metrics/${address}`,
  },
  KYC: {
    STATUS: (address: string) => `${API_BASE_URL}/api/kyc/status/${address}`,
    COMPREHENSIVE: `${API_BASE_URL}/api/kyc/comprehensive`,
    COMPLETE: `${API_BASE_URL}/api/kyc/complete`,
  },
  TRAVEL_RULE: {
    WALLET_STATUS: (address: string) => `${API_BASE_URL}/api/travel-rule/wallet-status/${address}`,
    WALLET_PROCESSED: `${API_BASE_URL}/api/travel-rule/wallet-processed`,
    ORIGINATOR: `${API_BASE_URL}/api/travel-rule/originator`,
    STATUS: (address: string) => `${API_BASE_URL}/api/travel-rule/status/${address}`,
    COMPLIANCE_REQUIREMENTS: `${API_BASE_URL}/api/travel-rule/compliance-requirements`,
  },
  EXCHANGE_RATE: {
    USD_INR: `${API_BASE_URL}/api/exchange-rate/usd-inr`,
  },
};

export default API_ENDPOINTS;
