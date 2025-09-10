
import { createPublicClient } from 'viem';

interface RateLimitedCall {
  timestamp: number;
  promise: Promise<any>;
}

class RateLimiter {
  private calls: RateLimitedCall[] = [];
  private maxRPS: number;
  private windowMs: number;

  constructor(maxRPS: number = 45) { // Set to 45 to stay safely under 50 RPS
    this.maxRPS = maxRPS;
    this.windowMs = 1000; // 1 second window
  }

  private cleanup() {
    const now = Date.now();
    this.calls = this.calls.filter(call => now - call.timestamp < this.windowMs);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.cleanup();

    if (this.calls.length >= this.maxRPS) {
      const oldestCall = this.calls[0];
      const waitTime = this.windowMs - (Date.now() - oldestCall.timestamp);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.cleanup();
      }
    }

    const call: RateLimitedCall = {
      timestamp: Date.now(),
      promise: fn()
    };

    this.calls.push(call);
    return call.promise;
  }

  async executeBatch<T>(fns: (() => Promise<T>)[], batchSize: number = 10): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < fns.length; i += batchSize) {
      const batch = fns.slice(i, i + batchSize);
      const batchPromises = batch.map(fn => this.execute(fn));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add small delay between batches
      if (i + batchSize < fns.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

export const blockchainRateLimiter = new RateLimiter(45);

// Rate-limited blockchain client wrapper
export function createRateLimitedClient(client: any) {
  return new Proxy(client, {
    get(target, prop) {
      const original = target[prop];
      
      if (typeof original === 'function' && (
        prop === 'readContract' ||
        prop === 'writeContract' ||
        prop === 'simulateContract' ||
        prop === 'estimateGas' ||
        prop === 'getBalance' ||
        prop === 'getBytecode' ||
        prop === 'getChainId'
      )) {
        return async (...args: any[]) => {
          return blockchainRateLimiter.execute(() => original.apply(target, args));
        };
      }
      
      return original;
    }
  });
}
