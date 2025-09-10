
import { CONTRACTS } from './vault-contract';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Create a public client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export interface StablePayMetrics {
  userBalance: bigint;
  yieldEarned: bigint;
  lockStatus: {
    isLocked: boolean;
    daysRemaining: number;
    unlockDate: Date | null;
  };
  apy: number;
  lastUpdated: Date;
}

export class StablePayDataService {
  private static instance: StablePayDataService;
  private cache = new Map<string, { data: StablePayMetrics; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): StablePayDataService {
    if (!StablePayDataService.instance) {
      StablePayDataService.instance = new StablePayDataService();
    }
    return StablePayDataService.instance;
  }

  async getStablePayMetrics(userAddress: string): Promise<StablePayMetrics> {
    const cached = this.cache.get(userAddress);
    const now = Date.now();

    // Return cached data if still fresh
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Fetch real-time data from StablePay vault
      const response = await fetch(`/api/stablepay/metrics/${userAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        const metrics: StablePayMetrics = {
          userBalance: BigInt(data.userBalance || '0'),
          yieldEarned: BigInt(data.yieldEarned || '0'),
          lockStatus: {
            isLocked: data.lockStatus?.isLocked || false,
            daysRemaining: data.lockStatus?.daysRemaining || 0,
            unlockDate: data.lockStatus?.unlockDate ? new Date(data.lockStatus.unlockDate) : null
          },
          apy: data.apy || 7,
          lastUpdated: new Date()
        };

        // Cache the result
        this.cache.set(userAddress, { data: metrics, timestamp: now });
        return metrics;
      }
    } catch (error) {
      console.error('Failed to fetch StablePay metrics:', error);
    }

    // Return default values if fetch fails
    const defaultMetrics: StablePayMetrics = {
      userBalance: 0n,
      yieldEarned: 0n,
      lockStatus: {
        isLocked: false,
        daysRemaining: 0,
        unlockDate: null
      },
      apy: 7,
      lastUpdated: new Date()
    };

    this.cache.set(userAddress, { data: defaultMetrics, timestamp: now });
    return defaultMetrics;
  }

  // Calculate real-time yield based on time elapsed
  calculateCurrentYield(principal: bigint, apy: number, hoursElapsed: number): bigint {
    if (!principal || principal === 0n) return 0n;

    const principalNumber = Number(principal) / 1e6; // Convert from USDC wei
    const hourlyRate = apy / 100 / 365 / 24; // APY to hourly rate
    const yieldEarned = principalNumber * hourlyRate * hoursElapsed;
    
    return BigInt(Math.floor(yieldEarned * 1e6)); // Convert back to USDC wei
  }

  // Clear cache for a specific user
  clearCache(userAddress?: string): void {
    if (userAddress) {
      this.cache.delete(userAddress);
    } else {
      this.cache.clear();
    }
  }
}

export const stablePayData = StablePayDataService.getInstance();
