import { parseAbi, formatUnits, parseUnits } from 'viem';
import { blockchainRateLimiter } from './rate-limiter';

// Updated Vault ABI to match the corrected smart contract
export const VAULT_ABI = parseAbi([
  'function deposit(uint256 amount, uint256 lockMonths) external',
  'function depositWithLockPeriod(uint256 assets, address receiver, uint256 lockPeriodMonths) external returns (uint256)',
  'function withdraw(uint256 assets, address receiver, address owner) external returns (uint256)',
  'function claimYield() external returns (uint256)',
  'function getDepositBalance(address user) external view returns (uint256)',
  'function getUserDeposit(address user) external view returns (uint256 amount, uint256 lockUntil, uint256 yieldEarned)',
  'function getUserDeposits(address user) external view returns ((uint256 amount, uint256 timestamp, uint256 lockMonths, uint256 yieldEarned)[])',
  'function getYieldAvailable(address user) external view returns (uint256)',
  'function getLatestDeposit(address user) external view returns (uint256,uint256,uint256,uint256,bool)',
  'function checkDepositReadiness(address user, uint256 amount) external view returns (bool,uint256,uint256,bool,bool,string)',
  'function getTotalVaultBalance() external view returns (uint256)',
  'function totalAssets() external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function getAPYForLockPeriod(uint256 lockPeriodMonths) external view returns (uint256)',
  'function getVaultStats() external view returns (uint256,uint256,uint256,uint256,uint256)',
  'function checkAllowance(address user, uint256 amount) external view returns (bool,uint256)',
  'function calculateYield(address user) external view returns (uint256)',
  'event USDCDeposited(address indexed user, uint256 amount, uint256 lockMonths, uint256 timestamp)',
  'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil)',
  'event DepositWithLock(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil, uint256 lockPeriodMonths, uint256 apy)',
  'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
  'event YieldClaimed(address indexed user, uint256 amount)'
]);

export const USDC_ABI = parseAbi([
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)'
]);

// Production contract addresses on Base mainnet - VERIFIED CORRECT
export const CONTRACTS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`, // Official USDC on Base
  VAULT: "0x4bc7a35d6e09d102087ed84445137f04540a8790" as `0x${string}`,  // Your StablePay Vault contract
  STABLE_PAY_VAULT: "0x4bc7a35d6e09d102087ed84445137f04540a8790" as `0x${string}` // Alias for vault contract
};

// Rate-limited blockchain operations
export const RATE_LIMITED_OPS = {
  async checkBalance(client: any, address: string, userAddress: string) {
    return blockchainRateLimiter.execute(() =>
      client.readContract({
        address: address,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [userAddress]
      })
    );
  },

  async checkAllowance(client: any, address: string, userAddress: string, spenderAddress: string) {
    return blockchainRateLimiter.execute(() =>
      client.readContract({
        address: address,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [userAddress, spenderAddress]
      })
    );
  },

  async checkDepositReadiness(client: any, vaultAddress: string, userAddress: string, amount: bigint) {
    return blockchainRateLimiter.execute(() =>
      client.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'checkDepositReadiness',
        args: [userAddress, amount]
      })
    );
  },

  async getVaultStats(client: any, vaultAddress: string) {
    return blockchainRateLimiter.execute(() =>
      client.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'getTotalVaultBalance' // Updated to getTotalVaultBalance
      })
    );
  },

  async getUserDeposit(client: any, vaultAddress: string, userAddress: string) {
    return blockchainRateLimiter.execute(() =>
      client.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'getDepositBalance', // Updated to getDepositBalance
        args: [userAddress]
      })
    );
  }
};

// Debug utilities for USDC transfers
export const DEBUG_UTILS = {
  verifyUSDCAddress: () => {
    console.log("✅ USDC Address (Base):", CONTRACTS.USDC);
    console.log("✅ Vault Address:", CONTRACTS.VAULT);
    return CONTRACTS.USDC === "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  },

  logTransferParams: (from: string, to: string, amount: string) => {
    console.log("=== USDC Transfer Debug ===");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Amount:", amount, "USDC");
    console.log("Amount (wei):", parseUnits(amount, 6).toString());
    console.log("Network: Base (Chain ID: 8453)");
    console.log("Gas recommendation: 600,000+");
    console.log("========================");
  },

  validateTransferParams: (from: string, to: string, amount: string, balance: bigint) => {
    const errors: string[] = [];

    if (!from || !to) errors.push("Missing addresses");
    if (!amount || parseFloat(amount) <= 0) errors.push("Invalid amount");
    if (parseUnits(amount, 6) > balance) errors.push("Insufficient balance");
    if (to.toLowerCase() === from.toLowerCase()) errors.push("Cannot send to self");

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Comprehensive deposit debugging
  logDepositAttempt: (userAddress: string, amount: string, lockPeriod: number, balance?: bigint, allowance?: bigint) => {
    console.log("=== VAULT DEPOSIT DEBUG ===");
    console.log("User:", userAddress);
    console.log("Deposit amount:", amount, "USDC");
    console.log("Lock period:", lockPeriod, "months");
    console.log("Amount (wei):", parseUnits(amount, 6).toString());
    console.log("User balance:", balance ? formatUnits(balance, 6) + " USDC" : "Unknown");
    console.log("Allowance:", allowance ? formatUnits(allowance, 6) + " USDC" : "Unknown");
    console.log("USDC contract:", CONTRACTS.USDC);
    console.log("Vault contract:", CONTRACTS.VAULT);
    console.log("Network: Base (8453)");
    console.log("Min deposit: 1 USDC");
    console.log("Recommended gas: 600,000");
    console.log("===========================");
  },

  // Check common failure points
  diagnoseFailure: (error: any) => {
    console.log("=== DEPOSIT FAILURE DIAGNOSIS ===");
    console.log("Error message:", error?.message || "Unknown");
    console.log("Error code:", error?.code || "N/A");
    
    const commonIssues: string[] = [];
    
    if (error?.message?.includes('insufficient funds') || error?.code === 'INSUFFICIENT_FUNDS') {
      commonIssues.push("❌ Insufficient ETH for gas fees");
    }
    
    if (error?.message?.includes('allowance') || error?.message?.includes('approval')) {
      commonIssues.push("❌ Insufficient USDC allowance - need to approve first");
    }
    
    if (error?.message?.includes('balance')) {
      commonIssues.push("❌ Insufficient USDC balance");
    }
    
    if (error?.message?.includes('network') || error?.code === 'NETWORK_ERROR') {
      commonIssues.push("❌ Network connection issue");
    }
    
    if (error?.code === 4001 || error?.message?.includes('denied')) {
      commonIssues.push("❌ Transaction cancelled by user");
    }
    
    if (error?.message?.includes('gas')) {
      commonIssues.push("❌ Gas estimation failed - try higher gas limit");
    }

    if (commonIssues.length === 0) {
      commonIssues.push("❓ Unknown error - check console for details");
    }

    console.log("Likely issues:");
    commonIssues.forEach(issue => console.log(" ", issue));
    console.log("================================");
  }
};

export interface UserDeposit {
  amount: bigint;
  lockUntil: bigint;
  yieldEarned: bigint;
  isLocked: boolean;
  daysRemaining: number;
}