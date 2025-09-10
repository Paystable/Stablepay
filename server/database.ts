import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { 
  users, 
  kycRecords, 
  transactions, 
  withdrawalRequests,
  travelRuleCompliance,
  type InsertUser,
  type InsertKycRecord 
} from "../shared/schema";
import type { User, KycRecord } from '@shared/schema';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not configured - running in mock mode for development');
}

// Development mode fallback - create mock database connection
let db: any;
let sql: any;

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your_neon_database_url_here' && process.env.DATABASE_URL !== 'postgresql://localhost:5432/stablepay_dev') {
  try {
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, {
      schema: { users, kycRecords, transactions, withdrawalRequests, travelRuleCompliance }
    });
  } catch (error) {
    console.warn('Database connection failed, running in mock mode:', error.message);
    db = null;
  }
} else {
  console.warn('Running in mock database mode for local development');
  db = null;
}

export { db };

// Database service functions
export class DatabaseService {
  static async createUser(userData: InsertUser): Promise<User> {
    if (!db) {
      // Mock implementation for development
      return {
        id: Math.floor(Math.random() * 1000),
        username: userData.username,
        password: userData.password,
        walletAddress: userData.walletAddress || null,
        email: userData.email || null,
        fullName: userData.fullName || null,
        kycStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User;
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async getUserById(id: number): Promise<User | undefined> {
    if (!db) {
      return undefined; // Mock: no user found
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async getUserByAddress(address: string): Promise<User | undefined> {
    if (!db) {
      return undefined; // Mock: no user found
    }
    const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
    return user;
  }

  static async createKycRecord(kycData: InsertKycRecord): Promise<KycRecord> {
    if (!db) {
      // Mock implementation for development
      return {
        id: Math.floor(Math.random() * 1000),
        userAddress: kycData.userAddress,
        fullName: kycData.fullName,
        email: kycData.email,
        phoneNumber: kycData.phoneNumber || null,
        aadharNumber: kycData.aadharNumber || null,
        panNumber: kycData.panNumber || null,
        status: 'pending',
        verificationData: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as KycRecord;
    }
    const [record] = await db.insert(kycRecords).values(kycData).returning();
    return record;
  }

  static async getKycByAddress(address: string): Promise<KycRecord | undefined> {
    if (!db) {
      // Mock: return a verified status for demo
      return {
        id: 1,
        userAddress: address,
        fullName: 'Demo User',
        email: 'demo@example.com',
        phoneNumber: null,
        aadharNumber: null,
        panNumber: null,
        status: 'verified',
        verificationData: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as KycRecord;
    }
    const [record] = await db.select().from(kycRecords).where(eq(kycRecords.userAddress, address));
    return record;
  }

  static async updateKycStatus(userAddress: string, status: string) {
    if (!db) {
      console.log(`Mock: Updated KYC status for ${userAddress} to ${status}`);
      return Promise.resolve();
    }
    return await db.update(kycRecords)
      .set({ 
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(kycRecords.userAddress, userAddress))
      .execute();
  }

  // Travel Rule Compliance methods
  static async createTravelRuleRecord(data: {
    userAddress: string;
    status: 'pending' | 'completed' | 'skipped';
    originatorInfo?: string;
    transactionAmount?: string;
    complianceLevel?: 'basic' | 'enhanced' | 'high_risk';
    riskCategory?: 'low' | 'medium' | 'high';
  }) {
    if (!db) {
      console.log(`Mock: Created travel rule record for ${data.userAddress}`);
      return {
        id: Math.floor(Math.random() * 1000),
        userAddress: data.userAddress,
        status: data.status,
        transactionAmount: data.transactionAmount || null,
        transactionCurrency: 'USD',
        complianceLevel: data.complianceLevel || 'basic',
        originatorInfo: data.originatorInfo || null,
        riskCategory: data.riskCategory || 'low',
        additionalVerificationRequired: false,
        verificationMethod: null,
        dataSource: 'self_declared',
        verificationTimestamp: null,
        expiryDate: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    try {
      return await db.insert(travelRuleCompliance)
        .values({
          userAddress: data.userAddress,
          status: data.status,
          originatorInfo: data.originatorInfo,
          transactionAmount: data.transactionAmount,
          complianceLevel: data.complianceLevel || 'basic',
          riskCategory: data.riskCategory || 'low',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
        .then(rows => rows[0]);
    } catch (error) {
      // If record already exists, update it instead
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return await this.updateTravelRuleRecord(data.userAddress, {
          status: data.status,
          originatorInfo: data.originatorInfo,
          transactionAmount: data.transactionAmount,
          complianceLevel: data.complianceLevel,
          riskCategory: data.riskCategory
        });
      }
      throw error;
    }
  }

  static async getTravelRuleByAddress(userAddress: string) {
    if (!db) {
      return null; // Mock: no record found
    }
    return await db.select()
      .from(travelRuleCompliance)
      .where(eq(travelRuleCompliance.userAddress, userAddress))
      .then(rows => rows[0] || null);
  }

  static async updateTravelRuleRecord(userAddress: string, data: {
    status?: 'pending' | 'completed' | 'skipped';
    originatorInfo?: string;
    transactionAmount?: string;
    complianceLevel?: 'basic' | 'enhanced' | 'high_risk';
    riskCategory?: 'low' | 'medium' | 'high';
    additionalVerificationRequired?: boolean;
    verificationMethod?: string;
    verificationTimestamp?: Date;
    expiryDate?: Date;
    completedAt?: Date;
  }) {
    if (!db) {
      console.log(`Mock: Updated travel rule record for ${userAddress}`);
      return Promise.resolve();
    }
    return await db.update(travelRuleCompliance)
      .set({ 
        ...data,
        updatedAt: new Date()
      })
      .where(eq(travelRuleCompliance.userAddress, userAddress))
      .execute();
  }

  // Check if Travel Rule compliance is expired
  static async checkTravelRuleExpiry(userAddress: string): Promise<boolean> {
    if (!db) {
      return false; // Mock: not expired
    }
    const record = await this.getTravelRuleByAddress(userAddress);
    if (!record || !record.expiryDate) return false;
    
    return new Date() > record.expiryDate;
  }

  // Get compliance summary for reporting
  static async getComplianceSummary() {
    if (!db) {
      return []; // Mock: empty summary
    }
    const summary = await db.select({
      complianceLevel: travelRuleCompliance.complianceLevel,
      riskCategory: travelRuleCompliance.riskCategory,
      count: sql`count(*)`.as('count')
    })
    .from(travelRuleCompliance)
    .where(eq(travelRuleCompliance.status, 'completed'))
    .groupBy(travelRuleCompliance.complianceLevel, travelRuleCompliance.riskCategory);
    
    return summary;
  }

  static async createTransaction(txData: {
    userAddress: string;
    txHash: string;
    type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'yield_claim';
    amount: string;
    blockNumber?: number;
  }) {
    if (!db) {
      console.log(`Mock: Created transaction for ${txData.userAddress}`);
      return {
        id: Math.floor(Math.random() * 1000),
        userAddress: txData.userAddress,
        txHash: txData.txHash,
        type: txData.type,
        amount: txData.amount,
        status: 'completed',
        blockNumber: txData.blockNumber || null,
        timestamp: new Date(),
        createdAt: new Date()
      };
    }
    const [transaction] = await db.insert(transactions).values(txData).returning();
    return transaction;
  }

  static async getTransactionsByAddress(address: string) {
    if (!db) {
      return []; // Mock: no transactions
    }
    return await db.select().from(transactions)
      .where(eq(transactions.userAddress, address))
      .orderBy(desc(transactions.timestamp));
  }

  static async createWithdrawalRequest(withdrawalData: {
    userAddress: string;
    usdcAmount: string;
    inrAmount: string;
    txHash: string;
    verificationType: 'bank' | 'upi';
    bankAccount?: string;
    ifscCode?: string;
    upiId?: string;
  }) {
    if (!db) {
      console.log(`Mock: Created withdrawal request for ${withdrawalData.userAddress}`);
      return {
        id: Math.floor(Math.random() * 1000),
        userAddress: withdrawalData.userAddress,
        usdcAmount: withdrawalData.usdcAmount,
        inrAmount: withdrawalData.inrAmount,
        txHash: withdrawalData.txHash,
        verificationType: withdrawalData.verificationType,
        bankAccount: withdrawalData.bankAccount || null,
        ifscCode: withdrawalData.ifscCode || null,
        upiId: withdrawalData.upiId || null,
        status: 'processing',
        createdAt: new Date(),
        processedAt: null
      };
    }
    const [request] = await db.insert(withdrawalRequests).values(withdrawalData).returning();
    return request;
  }
}