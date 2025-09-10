
import { Coinbase, SmartContract } from '@coinbase/coinbase-sdk';

interface SmartContractEvent {
  block_height: number;
  block_hash: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  contract_address: string;
  event_name: string;
  event_signature: string;
  decoded_event: {
    name: string;
    inputs: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
  block_timestamp: string;
}

interface EventsResponse {
  data: SmartContractEvent[];
  has_more: boolean;
  next_page: string | null;
}

export class CoinbaseEventsService {
  private static readonly NETWORK_ID = 'base-mainnet';
  private static readonly VAULT_ADDRESS = '0x4bc7a35d6e09d102087ed84445137f04540a8790';
  private static coinbase: Coinbase;

  private static async initializeCoinbase() {
    if (!this.coinbase) {
      const apiKey = process.env.COINBASE_API_KEY;
      const privateKey = process.env.COINBASE_PRIVATE_KEY;
      
      if (!apiKey) {
        throw new Error('COINBASE_API_KEY not configured');
      }

      this.coinbase = new Coinbase({
        apiKeyName: apiKey,
        privateKey: privateKey || undefined
      });
    }
    return this.coinbase;
  }

  private static async getSmartContract() {
    const coinbase = await this.initializeCoinbase();
    return await SmartContract.read(this.NETWORK_ID, this.VAULT_ADDRESS);
  }

  /**
   * Get smart contract events for the StablePay vault using CDP SDK
   */
  static async getVaultEvents(options: {
    eventName?: string;
    fromBlockHeight?: number;
    toBlockHeight?: number;
    limit?: number;
    page?: string;
  } = {}): Promise<EventsResponse> {
    try {
      const { eventName, fromBlockHeight, toBlockHeight, limit = 100 } = options;
      
      const smartContract = await this.getSmartContract();
      
      console.log(`Fetching vault events using CDP SDK`);

      // Get events using CDP SDK
      const events = await smartContract.listEvents({
        event_name: eventName,
        from_block_height: fromBlockHeight,
        to_block_height: toBlockHeight,
        limit: limit
      });

      // Transform CDP SDK events to our interface format
      const transformedEvents: SmartContractEvent[] = events.map(event => ({
        block_height: event.block_height,
        block_hash: event.block_hash,
        transaction_hash: event.transaction_hash,
        transaction_index: event.transaction_index,
        log_index: event.log_index,
        contract_address: event.contract_address,
        event_name: event.event_name,
        event_signature: event.event_signature,
        decoded_event: {
          name: event.decoded_event?.name || '',
          inputs: event.decoded_event?.inputs || []
        },
        block_timestamp: event.block_timestamp
      }));
      
      console.log(`Retrieved ${transformedEvents.length} vault events using CDP SDK`);
      
      return {
        data: transformedEvents,
        has_more: events.length === limit,
        next_page: null // CDP SDK handles pagination differently
      };
    } catch (error) {
      console.error('Error fetching vault events with CDP SDK:', error);
      return { data: [], has_more: false, next_page: null };
    }
  }

  /**
   * Get deposit events specifically
   */
  static async getDepositEvents(fromBlockHeight?: number, limit?: number): Promise<SmartContractEvent[]> {
    const response = await this.getVaultEvents({
      eventName: 'DepositSuccessful',
      fromBlockHeight,
      limit
    });
    return response.data;
  }

  /**
   * Get withdrawal events specifically
   */
  static async getWithdrawalEvents(fromBlockHeight?: number, limit?: number): Promise<SmartContractEvent[]> {
    const response = await this.getVaultEvents({
      eventName: 'WithdrawalSuccessful',
      fromBlockHeight,
      limit
    });
    return response.data;
  }

  /**
   * Get yield claim events specifically
   */
  static async getYieldClaimEvents(fromBlockHeight?: number, limit?: number): Promise<SmartContractEvent[]> {
    const response = await this.getVaultEvents({
      eventName: 'YieldClaimed',
      fromBlockHeight,
      limit
    });
    return response.data;
  }

  /**
   * Get events for a specific user address
   */
  static async getUserEvents(userAddress: string, limit?: number): Promise<SmartContractEvent[]> {
    const allEvents = await this.getVaultEvents({ limit: limit || 1000 });
    
    // Filter events that involve the user address
    return allEvents.data.filter(event => {
      const inputs = event.decoded_event?.inputs || [];
      return inputs.some(input => 
        input.value.toLowerCase() === userAddress.toLowerCase()
      );
    });
  }

  /**
   * Get recent events for dashboard display
   */
  static async getRecentActivity(limit: number = 50): Promise<{
    deposits: SmartContractEvent[];
    withdrawals: SmartContractEvent[];
    yieldClaims: SmartContractEvent[];
    totalEvents: number;
  }> {
    try {
      const [deposits, withdrawals, yieldClaims] = await Promise.all([
        this.getDepositEvents(undefined, limit),
        this.getWithdrawalEvents(undefined, limit),
        this.getYieldClaimEvents(undefined, limit)
      ]);

      return {
        deposits,
        withdrawals,
        yieldClaims,
        totalEvents: deposits.length + withdrawals.length + yieldClaims.length
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return { deposits: [], withdrawals: [], yieldClaims: [], totalEvents: 0 };
    }
  }

  /**
   * Get vault statistics using CDP SDK
   */
  static async getVaultStatistics(): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalYieldPaid: number;
    activeUsers: Set<string>;
  }> {
    try {
      const smartContract = await this.getSmartContract();
      
      // Get all events to calculate statistics
      const [deposits, withdrawals, yieldClaims] = await Promise.all([
        smartContract.listEvents({ event_name: 'DepositSuccessful', limit: 1000 }),
        smartContract.listEvents({ event_name: 'WithdrawalSuccessful', limit: 1000 }),
        smartContract.listEvents({ event_name: 'YieldClaimed', limit: 1000 })
      ]);

      const activeUsers = new Set<string>();
      let totalDeposits = 0;
      let totalWithdrawals = 0;
      let totalYieldPaid = 0;

      // Process deposits
      deposits.forEach(event => {
        const userInput = event.decoded_event?.inputs.find(i => i.name === 'user');
        const amountInput = event.decoded_event?.inputs.find(i => i.name === 'amount');
        
        if (userInput) activeUsers.add(userInput.value);
        if (amountInput) totalDeposits += Number(amountInput.value) / 1e6;
      });

      // Process withdrawals
      withdrawals.forEach(event => {
        const userInput = event.decoded_event?.inputs.find(i => i.name === 'user');
        const amountInput = event.decoded_event?.inputs.find(i => i.name === 'totalWithdrawn');
        
        if (userInput) activeUsers.add(userInput.value);
        if (amountInput) totalWithdrawals += Number(amountInput.value) / 1e6;
      });

      // Process yield claims
      yieldClaims.forEach(event => {
        const userInput = event.decoded_event?.inputs.find(i => i.name === 'user');
        const amountInput = event.decoded_event?.inputs.find(i => i.name === 'amount');
        
        if (userInput) activeUsers.add(userInput.value);
        if (amountInput) totalYieldPaid += Number(amountInput.value) / 1e6;
      });

      return {
        totalDeposits,
        totalWithdrawals,
        totalYieldPaid,
        activeUsers
      };
    } catch (error) {
      console.error('Error getting vault statistics:', error);
      return {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalYieldPaid: 0,
        activeUsers: new Set()
      };
    }
  }

  /**
   * Format event data for display
   */
  static formatEventForDisplay(event: SmartContractEvent): {
    type: string;
    user: string;
    amount: string;
    timestamp: Date;
    txHash: string;
    blockHeight: number;
  } {
    const inputs = event.decoded_event?.inputs || [];
    
    let user = '';
    let amount = '';
    
    // Extract user address and amount based on event type
    if (event.event_name === 'DepositSuccessful') {
      user = inputs.find(i => i.name === 'user')?.value || '';
      amount = inputs.find(i => i.name === 'amount')?.value || '0';
    } else if (event.event_name === 'WithdrawalSuccessful') {
      user = inputs.find(i => i.name === 'user')?.value || '';
      amount = inputs.find(i => i.name === 'totalWithdrawn')?.value || '0';
    } else if (event.event_name === 'YieldClaimed') {
      user = inputs.find(i => i.name === 'user')?.value || '';
      amount = inputs.find(i => i.name === 'amount')?.value || '0';
    }

    return {
      type: event.event_name,
      user,
      amount: (Number(amount) / 1e6).toFixed(2), // Convert from wei to USDC
      timestamp: new Date(event.block_timestamp),
      txHash: event.transaction_hash,
      blockHeight: event.block_height
    };
  }
}
