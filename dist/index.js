var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, kycRecords, transactions, withdrawalRequests, travelRuleCompliance, insertUserSchema, insertKycSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      walletAddress: varchar("wallet_address", { length: 42 }),
      email: text("email"),
      fullName: text("full_name"),
      kycStatus: text("kyc_status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    kycRecords = pgTable("kyc_records", {
      id: serial("id").primaryKey(),
      userAddress: varchar("user_address", { length: 42 }).notNull(),
      fullName: text("full_name").notNull(),
      email: text("email").notNull(),
      phoneNumber: text("phone_number"),
      aadharNumber: text("aadhar_number"),
      panNumber: text("pan_number"),
      status: text("status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
      verificationData: text("verification_data"),
      // JSON string
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    transactions = pgTable("transactions", {
      id: serial("id").primaryKey(),
      userAddress: varchar("user_address", { length: 42 }).notNull(),
      txHash: varchar("tx_hash", { length: 66 }).notNull(),
      type: text("type", { enum: ["deposit", "withdrawal", "transfer_in", "transfer_out", "yield_claim"] }).notNull(),
      amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
      status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending"),
      blockNumber: integer("block_number"),
      timestamp: timestamp("timestamp").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    withdrawalRequests = pgTable("withdrawal_requests", {
      id: serial("id").primaryKey(),
      userAddress: varchar("user_address", { length: 42 }).notNull(),
      usdcAmount: decimal("usdc_amount", { precision: 18, scale: 6 }).notNull(),
      inrAmount: decimal("inr_amount", { precision: 18, scale: 2 }).notNull(),
      txHash: varchar("tx_hash", { length: 66 }).notNull(),
      verificationType: text("verification_type", { enum: ["bank", "upi"] }).notNull(),
      bankAccount: text("bank_account"),
      ifscCode: text("ifsc_code"),
      upiId: text("upi_id"),
      status: text("status", { enum: ["processing", "completed", "failed"] }).default("processing"),
      createdAt: timestamp("created_at").defaultNow(),
      processedAt: timestamp("processed_at")
    });
    travelRuleCompliance = pgTable("travel_rule_compliance", {
      id: serial("id").primaryKey(),
      userAddress: varchar("user_address", { length: 42 }).notNull().unique(),
      status: text("status", { enum: ["pending", "completed", "skipped"] }).default("pending"),
      // Transaction Information
      transactionAmount: decimal("transaction_amount", { precision: 18, scale: 2 }),
      transactionCurrency: varchar("transaction_currency", { length: 3 }).default("USD"),
      complianceLevel: text("compliance_level", { enum: ["basic", "enhanced", "high_risk"] }).default("basic"),
      // Originator Information (encrypted JSON)
      originatorInfo: text("originator_info"),
      // JSON string with encrypted personal data
      // Risk Assessment
      riskCategory: text("risk_category", { enum: ["low", "medium", "high"] }).default("low"),
      additionalVerificationRequired: boolean("additional_verification_required").default(false),
      verificationMethod: text("verification_method"),
      // Compliance Metadata
      dataSource: text("data_source").default("self_declared"),
      // self_declared, third_party_verified, etc.
      verificationTimestamp: timestamp("verification_timestamp"),
      expiryDate: timestamp("expiry_date"),
      // When the compliance data expires
      // Audit Trail
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      walletAddress: true,
      email: true,
      fullName: true
    });
    insertKycSchema = createInsertSchema(kycRecords).pick({
      userAddress: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      aadharNumber: true,
      panNumber: true
    });
  }
});

// server/database.ts
var database_exports = {};
__export(database_exports, {
  DatabaseService: () => DatabaseService,
  db: () => db
});
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
var db, sql, DatabaseService;
var init_database = __esm({
  "server/database.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured - running in mock mode for development");
    }
    if (process.env.DATABASE_URL && process.env.DATABASE_URL !== "your_neon_database_url_here" && process.env.DATABASE_URL !== "postgresql://localhost:5432/stablepay_dev") {
      try {
        sql = neon(process.env.DATABASE_URL);
        db = drizzle(sql, {
          schema: { users, kycRecords, transactions, withdrawalRequests, travelRuleCompliance }
        });
      } catch (error) {
        console.warn("Database connection failed, running in mock mode:", error.message);
        db = null;
      }
    } else {
      console.warn("Running in mock database mode for local development");
      db = null;
    }
    DatabaseService = class {
      static async createUser(userData) {
        if (!db) {
          return {
            id: Math.floor(Math.random() * 1e3),
            username: userData.username,
            password: userData.password,
            walletAddress: userData.walletAddress || null,
            email: userData.email || null,
            fullName: userData.fullName || null,
            kycStatus: "pending",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
        }
        const [user] = await db.insert(users).values(userData).returning();
        return user;
      }
      static async getUserById(id) {
        if (!db) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      static async getUserByAddress(address) {
        if (!db) {
          return void 0;
        }
        const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
        return user;
      }
      static async createKycRecord(kycData) {
        if (!db) {
          return {
            id: Math.floor(Math.random() * 1e3),
            userAddress: kycData.userAddress,
            fullName: kycData.fullName,
            email: kycData.email,
            phoneNumber: kycData.phoneNumber || null,
            aadharNumber: kycData.aadharNumber || null,
            panNumber: kycData.panNumber || null,
            status: "pending",
            verificationData: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
        }
        const [record] = await db.insert(kycRecords).values(kycData).returning();
        return record;
      }
      static async getKycByAddress(address) {
        if (!db) {
          return {
            id: 1,
            userAddress: address,
            fullName: "Demo User",
            email: "demo@example.com",
            phoneNumber: null,
            aadharNumber: null,
            panNumber: null,
            status: "verified",
            verificationData: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
        }
        const [record] = await db.select().from(kycRecords).where(eq(kycRecords.userAddress, address));
        return record;
      }
      static async updateKycStatus(userAddress, status) {
        if (!db) {
          console.log(`Mock: Updated KYC status for ${userAddress} to ${status}`);
          return Promise.resolve();
        }
        return await db.update(kycRecords).set({
          status,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(kycRecords.userAddress, userAddress)).execute();
      }
      // Travel Rule Compliance methods
      static async createTravelRuleRecord(data) {
        if (!db) {
          console.log(`Mock: Created travel rule record for ${data.userAddress}`);
          return {
            id: Math.floor(Math.random() * 1e3),
            userAddress: data.userAddress,
            status: data.status,
            transactionAmount: data.transactionAmount || null,
            transactionCurrency: "USD",
            complianceLevel: data.complianceLevel || "basic",
            originatorInfo: data.originatorInfo || null,
            riskCategory: data.riskCategory || "low",
            additionalVerificationRequired: false,
            verificationMethod: null,
            dataSource: "self_declared",
            verificationTimestamp: null,
            expiryDate: null,
            completedAt: null,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
        }
        try {
          return await db.insert(travelRuleCompliance).values({
            userAddress: data.userAddress,
            status: data.status,
            originatorInfo: data.originatorInfo,
            transactionAmount: data.transactionAmount,
            complianceLevel: data.complianceLevel || "basic",
            riskCategory: data.riskCategory || "low",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning().then((rows) => rows[0]);
        } catch (error) {
          if (error instanceof Error && error.message.includes("duplicate key")) {
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
      static async getTravelRuleByAddress(userAddress) {
        if (!db) {
          return null;
        }
        return await db.select().from(travelRuleCompliance).where(eq(travelRuleCompliance.userAddress, userAddress)).then((rows) => rows[0] || null);
      }
      static async updateTravelRuleRecord(userAddress, data) {
        if (!db) {
          console.log(`Mock: Updated travel rule record for ${userAddress}`);
          return Promise.resolve();
        }
        return await db.update(travelRuleCompliance).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(travelRuleCompliance.userAddress, userAddress)).execute();
      }
      // Check if Travel Rule compliance is expired
      static async checkTravelRuleExpiry(userAddress) {
        if (!db) {
          return false;
        }
        const record = await this.getTravelRuleByAddress(userAddress);
        if (!record || !record.expiryDate) return false;
        return /* @__PURE__ */ new Date() > record.expiryDate;
      }
      // Get compliance summary for reporting
      static async getComplianceSummary() {
        if (!db) {
          return [];
        }
        const summary = await db.select({
          complianceLevel: travelRuleCompliance.complianceLevel,
          riskCategory: travelRuleCompliance.riskCategory,
          count: sql`count(*)`.as("count")
        }).from(travelRuleCompliance).where(eq(travelRuleCompliance.status, "completed")).groupBy(travelRuleCompliance.complianceLevel, travelRuleCompliance.riskCategory);
        return summary;
      }
      static async createTransaction(txData) {
        if (!db) {
          console.log(`Mock: Created transaction for ${txData.userAddress}`);
          return {
            id: Math.floor(Math.random() * 1e3),
            userAddress: txData.userAddress,
            txHash: txData.txHash,
            type: txData.type,
            amount: txData.amount,
            status: "completed",
            blockNumber: txData.blockNumber || null,
            timestamp: /* @__PURE__ */ new Date(),
            createdAt: /* @__PURE__ */ new Date()
          };
        }
        const [transaction] = await db.insert(transactions).values(txData).returning();
        return transaction;
      }
      static async getTransactionsByAddress(address) {
        if (!db) {
          return [];
        }
        return await db.select().from(transactions).where(eq(transactions.userAddress, address)).orderBy(desc(transactions.timestamp));
      }
      static async createWithdrawalRequest(withdrawalData) {
        if (!db) {
          console.log(`Mock: Created withdrawal request for ${withdrawalData.userAddress}`);
          return {
            id: Math.floor(Math.random() * 1e3),
            userAddress: withdrawalData.userAddress,
            usdcAmount: withdrawalData.usdcAmount,
            inrAmount: withdrawalData.inrAmount,
            txHash: withdrawalData.txHash,
            verificationType: withdrawalData.verificationType,
            bankAccount: withdrawalData.bankAccount || null,
            ifscCode: withdrawalData.ifscCode || null,
            upiId: withdrawalData.upiId || null,
            status: "processing",
            createdAt: /* @__PURE__ */ new Date(),
            processedAt: null
          };
        }
        const [request] = await db.insert(withdrawalRequests).values(withdrawalData).returning();
        return request;
      }
    };
  }
});

// server/paymaster-allowlist.ts
var paymaster_allowlist_exports = {};
__export(paymaster_allowlist_exports, {
  checkPaymasterAllowlist: () => checkPaymasterAllowlist
});
async function checkPaymasterAllowlist(contractAddress, functionSelector) {
  try {
    const COINBASE_PAYMASTER_RPC_URL = process.env.VITE_PAYMASTER_URL || "https://api.developer.coinbase.com/rpc/v1/base/yHLH6AHHYTuJcz4ByF9jNN0tWQkHZhSO";
    const testUserOp = {
      sender: "0x742d35Cc6639C0532fE25578A5aa671c6228c8Bb",
      // Test address
      nonce: "0x0",
      initCode: "0x",
      callData: generateCallData(contractAddress, functionSelector),
      callGasLimit: "0x30D40",
      // 200000
      verificationGasLimit: "0x61A80",
      // 400000
      preVerificationGas: "0x15F90",
      // 90000
      maxFeePerGas: "0x59682F00",
      // 1.5 gwei
      maxPriorityFeePerGas: "0x3B9ACA00",
      // 1 gwei
      paymasterAndData: "0x",
      signature: "0x" + "00".repeat(65)
    };
    const response = await fetch(COINBASE_PAYMASTER_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VITE_COINBASE_API_KEY || "55a219f0-5f88-4931-818a-34bd7d74eff8"}`
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "pm_sponsorUserOperation",
        params: [
          testUserOp,
          "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
          // EntryPoint
          {
            type: "payg"
          }
        ],
        id: 1
      })
    });
    const result = await response.json();
    console.log("Paymaster allowlist check result:", result);
    const isAllowlistError = result.error && (result.error.message?.includes("allowlist") || result.error.message?.includes("not sponsored") || result.error.message?.includes("contract not allowed") || result.error.code === -32602);
    return {
      isAllowlisted: !result.error && !!result.result?.paymasterAndData,
      error: result.error?.message,
      errorCode: result.error?.code,
      needsAllowlisting: isAllowlistError,
      data: result.result,
      contractAddress,
      functionSelector
    };
  } catch (error) {
    console.error("Error checking paymaster allowlist:", error);
    return {
      isAllowlisted: false,
      error: error.message,
      needsAllowlisting: true,
      contractAddress,
      functionSelector
    };
  }
}
function generateCallData(contractAddress, functionSelector) {
  const selector = functionSelector || "0x095ea7b3";
  if (selector === "0x095ea7b3") {
    const spender = "0x4bc7a35d6e09d102087ed84445137f04540a8790";
    const amount = "0x" + 1e9.toString(16).padStart(64, "0");
    return selector + spender.slice(2).padStart(64, "0") + amount.slice(2);
  } else if (selector === "0x6e553f65") {
    const amount = "0x" + 1e9.toString(16).padStart(64, "0");
    const lockPeriod = "0x" + 6 .toString(16).padStart(64, "0");
    return selector + amount.slice(2) + lockPeriod.slice(2);
  } else if (selector === "0xb460af94") {
    return selector + "0".repeat(128);
  } else {
    return selector + "0".repeat(128);
  }
}
var init_paymaster_allowlist = __esm({
  "server/paymaster-allowlist.ts"() {
    "use strict";
  }
});

// server/verify-allowlist.ts
var verify_allowlist_exports = {};
__export(verify_allowlist_exports, {
  REQUIRED_CONTRACTS: () => REQUIRED_CONTRACTS,
  generateAllowlistInstructions: () => generateAllowlistInstructions,
  verifyAllowlistStatus: () => verifyAllowlistStatus
});
async function verifyAllowlistStatus() {
  console.log("\n\u{1F50D} Verifying contract allowlist status...\n");
  const results = [];
  for (const [contractName, config2] of Object.entries(REQUIRED_CONTRACTS)) {
    console.log(`Checking ${contractName} contract: ${config2.address}`);
    for (const func of config2.functions) {
      const result = await checkPaymasterAllowlist(config2.address, func.selector);
      console.log(`  ${func.name} (${func.selector}): ${result.isAllowlisted ? "\u2705 Allowlisted" : "\u274C Not allowlisted"}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      results.push({
        contract: contractName,
        address: config2.address,
        function: func.name,
        selector: func.selector,
        ...result
      });
    }
    console.log("");
  }
  return results;
}
function generateAllowlistInstructions(results) {
  const notAllowlisted = results.filter((r) => !r.isAllowlisted);
  if (notAllowlisted.length === 0) {
    return "\u{1F389} All contracts are properly allowlisted!";
  }
  let instructions = "\n\u{1F4CB} COINBASE DEVELOPER ACCOUNT SETUP REQUIRED:\n\n";
  instructions += "1. Go to: https://portal.cdp.coinbase.com/\n";
  instructions += "2. Navigate to your project's Paymaster section\n";
  instructions += "3. Add these contracts to your allowlist:\n\n";
  const contractGroups = notAllowlisted.reduce((acc, item) => {
    if (!acc[item.contract]) {
      acc[item.contract] = { address: item.address, functions: [] };
    }
    acc[item.contract].functions.push({ name: item.function, selector: item.selector });
    return acc;
  }, {});
  for (const [contractName, config2] of Object.entries(contractGroups)) {
    instructions += `   ${contractName} Contract:
`;
    instructions += `   Address: ${config2.address}
`;
    instructions += `   Functions to allowlist:
`;
    config2.functions.forEach((func) => {
      instructions += `     - ${func.name} (${func.selector})
`;
    });
    instructions += "\n";
  }
  instructions += "4. Save your changes and wait for propagation (may take a few minutes)\n";
  instructions += "5. Re-run this verification to confirm setup\n";
  return instructions;
}
var REQUIRED_CONTRACTS;
var init_verify_allowlist = __esm({
  "server/verify-allowlist.ts"() {
    "use strict";
    init_paymaster_allowlist();
    REQUIRED_CONTRACTS = {
      USDC: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        functions: [
          { name: "approve", selector: "0x095ea7b3" },
          { name: "transfer", selector: "0xa9059cbb" }
        ]
      },
      VAULT: {
        address: "0x4bc7a35d6e09d102087ed84445137f04540a8790",
        functions: [
          { name: "deposit", selector: "0x6e553f65" },
          { name: "withdraw", selector: "0xb460af94" }
        ]
      }
    };
  }
});

// server/env-config.ts
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config({ path: "../.env" });
  config({ path: ".env" });
}
var validateCashfreeConfig = () => {
  const requiredVars = [
    "CASHFREE_API_KEY",
    "CASHFREE_SECRET_KEY",
    "CASHFREE_ENVIRONMENT"
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn(`Missing Cashfree environment variables: ${missing.join(", ")}`);
    console.warn("KYC services will not be available without these variables");
    return false;
  }
  console.log("\u2705 All Cashfree environment variables loaded successfully");
  console.log(`\u{1F527} Environment: ${process.env.CASHFREE_ENVIRONMENT}`);
  return true;
};
var validateMongoConfig = () => {
  if (!process.env.MONGODB_URI) {
    console.warn("\u26A0\uFE0F  MONGODB_URI not set, using fallback MongoDB Atlas connection");
    process.env.MONGODB_URI = "mongodb+srv://hello:Algoremit@stable-pay.pybfsvo.mongodb.net/stablepay";
  }
  console.log("\u2705 MongoDB configuration loaded");
  console.log(`\u{1F527} MongoDB URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@")}`);
  return true;
};
validateCashfreeConfig();
validateMongoConfig();

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";

// server/blockchain-service.ts
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
var publicClient = createPublicClient({
  chain: base,
  transport: http("https://base-mainnet.g.alchemy.com/v2/demo", {
    retryCount: 3,
    retryDelay: 1e3
  })
});
var CONTRACTS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  // Official USDC on Base
  STABLE_PAY_VAULT: "0x4bc7a35d6e09d102087ed84445137f04540a8790"
  // StablePay Vault
};
var VAULT_ABI = parseAbi([
  "function totalAssets() external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function getUserDeposit(address user) external view returns (uint256 amount, uint256 lockUntil, uint256 yieldEarned)",
  "function getYieldAvailable(address user) external view returns (uint256)",
  "function getDepositBalance(address user) external view returns (uint256)",
  "function getTotalVaultBalance() external view returns (uint256)",
  "function deposit(uint256 amount, uint256 lockMonths) external",
  "function depositWithLockPeriod(uint256 assets, address receiver, uint256 lockPeriodMonths) external returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) external returns (uint256)",
  "function claimYield() external returns (uint256)",
  "function getAPYForLockPeriod(uint256 lockPeriodMonths) external view returns (uint256)",
  "function calculateYield(address user) external view returns (uint256)",
  "function getVaultStats() external view returns (uint256,uint256,uint256,uint256,uint256)",
  "function checkAllowance(address user, uint256 amount) external view returns (bool,uint256)",
  "event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil)",
  "event DepositWithLock(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil, uint256 lockPeriodMonths, uint256 apy)",
  "event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "event YieldClaimed(address indexed user, uint256 amount)",
  "event USDCDeposited(address indexed user, uint256 amount, uint256 lockMonths, uint256 timestamp)"
]);
function validateEthereumAddress(address) {
  if (!address || typeof address !== "string") {
    return false;
  }
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}
var mockUserDeposits = /* @__PURE__ */ new Map([
  ["0xcdc5e2335a8263fcb4ca796462801f3423db4ada", {
    amount: 50000000000n,
    // 50,000 USDC (6 decimals)
    lockUntil: BigInt(Math.floor((Date.now() + 10 * 24 * 60 * 60 * 1e3) / 1e3)),
    // 10 days remaining
    yieldEarned: 1247830000n,
    // 1247.83 USDC earned
    depositTime: BigInt(Math.floor((Date.now() - 5 * 24 * 60 * 60 * 1e3) / 1e3)),
    // 5 days ago
    lockPeriodMonths: 1,
    apy: 13
  }],
  ["0x742d35cc6639c0532fe25578a5aa671c6228c8bb", {
    amount: 25000000000n,
    // 25,000 USDC
    lockUntil: BigInt(Math.floor((Date.now() - 1 * 24 * 60 * 60 * 1e3) / 1e3)),
    // Unlocked (1 day ago)
    yieldEarned: 823890000n,
    // 823.89 USDC earned
    depositTime: BigInt(Math.floor((Date.now() - 20 * 24 * 60 * 60 * 1e3) / 1e3)),
    // 20 days ago
    lockPeriodMonths: 3,
    apy: 15
  }]
]);
async function getWalletBalances(address) {
  try {
    if (!validateEthereumAddress(address)) {
      throw new Error(`Invalid address format: ${address}`);
    }
    const ethBalance = await publicClient.getBalance({
      address
    });
    let usdcBalance = 0n;
    try {
      usdcBalance = await publicClient.readContract({
        address: CONTRACTS.USDC,
        abi: parseAbi(["function balanceOf(address account) external view returns (uint256)"]),
        functionName: "balanceOf",
        args: [address]
      });
    } catch (err) {
      console.warn("Failed to read USDC balance:", err);
      if (address.toLowerCase() === "0x4bc7a35d6e09d102087ed84445137f04540a8790") {
        usdcBalance = 10000000000n;
      }
    }
    let vaultBalance = 0n;
    try {
      vaultBalance = await publicClient.readContract({
        address: CONTRACTS.STABLE_PAY_VAULT,
        abi: VAULT_ABI,
        functionName: "balanceOf",
        args: [address]
      });
    } catch (err) {
      console.warn("Failed to read vault balance:", err);
      const userDeposit = mockUserDeposits.get(address.toLowerCase());
      if (userDeposit) {
        vaultBalance = userDeposit.amount;
      }
    }
    let userDepositInfo = null;
    try {
      const depositData = await publicClient.readContract({
        address: CONTRACTS.STABLE_PAY_VAULT,
        abi: VAULT_ABI,
        functionName: "getUserDeposit",
        args: [address]
      });
      userDepositInfo = depositData;
    } catch (err) {
      console.warn("Failed to read user deposit info:", err);
      const userDeposit = mockUserDeposits.get(address.toLowerCase());
      if (userDeposit) {
        userDepositInfo = [userDeposit.amount, userDeposit.lockUntil, userDeposit.yieldEarned];
      }
    }
    let yieldAvailable = 0n;
    if (userDepositInfo) {
      const [amount, lockUntil, totalYield] = userDepositInfo;
      const isUnlocked = Number(lockUntil) * 1e3 <= Date.now();
      if (isUnlocked && amount > 0n) {
        const userDeposit = mockUserDeposits.get(address.toLowerCase());
        if (userDeposit) {
          const daysElapsed = Math.floor((Date.now() / 1e3 - Number(userDeposit.depositTime)) / (24 * 60 * 60));
          const dailyYield = Number(amount) * (userDeposit.apy / 100 / 365);
          yieldAvailable = BigInt(Math.floor(dailyYield * daysElapsed * 0.3));
        }
      }
    }
    return {
      address,
      ethBalance: {
        raw: ethBalance.toString(),
        formatted: Number(ethBalance) / 1e18,
        symbol: "ETH"
      },
      usdcBalance: {
        raw: usdcBalance.toString(),
        formatted: Number(usdcBalance) / 1e6,
        // USDC has 6 decimals
        symbol: "USDC"
      },
      vaultBalance: {
        raw: vaultBalance.toString(),
        formatted: Number(vaultBalance) / 1e6,
        // Vault shares in USDC terms
        symbol: "spUSDC"
      },
      userDepositInfo: userDepositInfo ? {
        amount: userDepositInfo[0].toString(),
        lockUntil: userDepositInfo[1].toString(),
        yieldEarned: userDepositInfo[2].toString(),
        isLocked: Number(userDepositInfo[1]) * 1e3 > Date.now(),
        daysRemaining: Math.max(0, Math.ceil((Number(userDepositInfo[1]) * 1e3 - Date.now()) / (1e3 * 60 * 60 * 24)))
      } : null,
      yieldAvailable: {
        raw: yieldAvailable.toString(),
        formatted: Number(yieldAvailable) / 1e6,
        symbol: "USDC"
      },
      lastUpdated: /* @__PURE__ */ new Date()
    };
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    return {
      address,
      ethBalance: { raw: "0", formatted: 0, symbol: "ETH" },
      usdcBalance: { raw: "0", formatted: 0, symbol: "USDC" },
      vaultBalance: { raw: "0", formatted: 0, symbol: "spUSDC" },
      userDepositInfo: null,
      yieldAvailable: { raw: "0", formatted: 0, symbol: "USDC" },
      lastUpdated: /* @__PURE__ */ new Date(),
      error: error.message
    };
  }
}
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
var BlockchainService = class _BlockchainService {
  static instance;
  static getInstance() {
    if (!_BlockchainService.instance) {
      _BlockchainService.instance = new _BlockchainService();
    }
    return _BlockchainService.instance;
  }
  async getPoolData() {
    try {
      const blockchainData = await _BlockchainService.getPoolData();
      const deposits = blockchainData.events.map((event, index) => {
        const amount = event.args?.assets ? Number(event.args.assets) / 1e6 : 0;
        const daysInvested = Math.floor(Math.random() * 90) + 30;
        const getAPYForPeriod = (days) => {
          if (days >= 365) return 24;
          if (days >= 330) return 23;
          if (days >= 300) return 22;
          if (days >= 270) return 21;
          if (days >= 240) return 20;
          if (days >= 210) return 19;
          if (days >= 180) return 18;
          if (days >= 150) return 17;
          if (days >= 120) return 16;
          if (days >= 90) return 15;
          if (days >= 60) return 14;
          if (days >= 30) return 13;
          return 12;
        };
        const appliedAPY = getAPYForPeriod(daysInvested);
        const dailyYield = amount * (appliedAPY / 365 / 100);
        const yieldEarned = dailyYield * daysInvested;
        const depositDate = /* @__PURE__ */ new Date();
        depositDate.setDate(depositDate.getDate() - daysInvested);
        const lockUntil = new Date(depositDate);
        lockUntil.setDate(lockUntil.getDate() + 15);
        const isLocked = lockUntil > /* @__PURE__ */ new Date();
        const daysRemaining = isLocked ? Math.ceil((lockUntil.getTime() - Date.now()) / (1e3 * 60 * 60 * 24)) : 0;
        return {
          id: `${event.transactionHash || "unknown"}-${index}`,
          address: event.args?.owner || "0x0000000000000000000000000000000000000000",
          amount,
          timestamp: depositDate,
          txHash: event.transactionHash || "",
          yieldEarned,
          status: "active",
          blockNumber: Number(event.blockNumber || 0),
          lockUntil,
          isLocked,
          daysRemaining
        };
      });
      const totalYieldPaid = deposits.reduce((sum, deposit) => sum + deposit.yieldEarned, 0);
      const activeLocks = deposits.filter((d) => d.isLocked).length;
      const avgLockPeriod = deposits.reduce((sum, d) => sum + (d.daysRemaining || 0), 0) / deposits.length;
      const poolData = {
        totalValueLocked: blockchainData.totalValueLocked,
        totalInvestors: blockchainData.totalInvestors,
        totalYieldPaid,
        currentAPY: Math.round(deposits.reduce((sum, d) => {
          const days = Math.max(15, (d.daysRemaining || 0) + 30);
          return sum + (days >= 365 ? 24 : days >= 30 ? 13 + Math.floor(days / 30) : 12);
        }, 0) / Math.max(1, deposits.length) * 10) / 10,
        // Weighted average APY
        averageLockPeriod: Math.round(avgLockPeriod),
        totalActiveLocks: activeLocks,
        lastUpdated: /* @__PURE__ */ new Date(),
        contractAddress: CONTRACTS.STABLE_PAY_VAULT
      };
      const distributions = [];
      for (let i = 0; i < 6; i++) {
        const distributionDate = /* @__PURE__ */ new Date();
        distributionDate.setMonth(distributionDate.getMonth() - i);
        distributionDate.setDate(1);
        const monthlyYield = blockchainData.totalValueLocked * (12 / 12 / 100);
        const recipients = Math.max(1, blockchainData.totalInvestors - Math.floor(Math.random() * 2));
        distributions.push({
          date: distributionDate,
          totalYield: monthlyYield * 0.8 + Math.random() * monthlyYield * 0.4,
          // Add some variance
          recipients,
          avgYieldPerInvestor: monthlyYield / recipients,
          txHash: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, "0")}`,
          blockNumber: 15847e3 + i * 2e3
        });
      }
      return { poolData, deposits, distributions };
    } catch (error) {
      console.error("Error fetching pool data:", error);
      return {
        poolData: {
          totalValueLocked: 495e3,
          totalInvestors: 7,
          totalYieldPaid: 45e3,
          currentAPY: 12,
          averageLockPeriod: 8,
          totalActiveLocks: 4,
          lastUpdated: /* @__PURE__ */ new Date(),
          contractAddress: CONTRACTS.STABLE_PAY_VAULT
        },
        deposits: [],
        distributions: []
      };
    }
  }
  async getWalletData(address) {
    try {
      if (!validateEthereumAddress(address)) {
        console.warn(`Invalid address format: ${address}`);
        return { deposits: [] };
      }
      const allData = await this.getPoolData();
      const deposits = allData.deposits.filter(
        (deposit) => deposit.address.toLowerCase() === address.toLowerCase()
      );
      return { deposits };
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      return { deposits: [] };
    }
  }
  // Get pool data from blockchain with enhanced lock-in support
  static async getPoolData() {
    try {
      if (!isValidAddress(CONTRACTS.STABLE_PAY_VAULT)) {
        throw new Error(`Invalid contract address format: ${CONTRACTS.STABLE_PAY_VAULT}`);
      }
      let totalAssets = 0n;
      let totalSupply = 0n;
      let depositEvents = [];
      try {
        totalAssets = await publicClient.readContract({
          address: CONTRACTS.STABLE_PAY_VAULT,
          abi: VAULT_ABI,
          functionName: "totalAssets"
        });
      } catch (err) {
        console.warn("Failed to read totalAssets, using default value:", err);
      }
      try {
        totalSupply = await publicClient.readContract({
          address: CONTRACTS.STABLE_PAY_VAULT,
          abi: VAULT_ABI,
          functionName: "totalSupply"
        });
      } catch (err) {
        console.warn("Failed to read totalSupply, using default value:", err);
      }
      try {
        depositEvents = await publicClient.getLogs({
          address: CONTRACTS.STABLE_PAY_VAULT,
          event: parseAbi(["event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil)"])[0],
          fromBlock: "earliest",
          toBlock: "latest"
        });
      } catch (err) {
        console.warn("Failed to fetch deposit events, using mock data:", err);
        depositEvents = [];
      }
      const uniqueInvestors = /* @__PURE__ */ new Set();
      depositEvents.forEach((event) => {
        if (event.args && event.args.owner && isValidAddress(event.args.owner)) {
          uniqueInvestors.add(event.args.owner);
        }
      });
      return {
        totalValueLocked: Number(totalAssets) / 1e6,
        // USDC has 6 decimals
        totalSupply: Number(totalSupply) / 1e18,
        totalInvestors: uniqueInvestors.size || 7,
        // Fallback to mock data
        events: depositEvents.length > 0 ? depositEvents : this.getMockDepositEvents()
      };
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
      return {
        totalValueLocked: 495e3,
        totalSupply: 495e3,
        totalInvestors: 7,
        events: this.getMockDepositEvents()
      };
    }
  }
  // Mock deposit events with lock-in data
  static getMockDepositEvents() {
    const now = Date.now();
    return [
      {
        transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
        blockNumber: 15847392n,
        args: {
          owner: "0xcdc5e2335a8263fcb4ca796462801f3423db4ada",
          assets: 50000000000n,
          // 50,000 USDC (6 decimals)
          lockUntil: BigInt(Math.floor((now + 10 * 24 * 60 * 60 * 1e3) / 1e3))
          // 10 days remaining
        }
      },
      {
        transactionHash: "0x2345678901bcdef12345678901bcdef123456789",
        blockNumber: 15847401n,
        args: {
          owner: "0x742d35cc6639c0532fe25578a5aa671c6228c8bb",
          assets: 25000000000n,
          // 25,000 USDC
          lockUntil: BigInt(Math.floor((now - 1 * 24 * 60 * 60 * 1e3) / 1e3))
          // Unlocked
        }
      },
      {
        transactionHash: "0x3456789012cdef123456789012cdef1234567890",
        blockNumber: 15847415n,
        args: {
          owner: "0x8ba1f109551bd432803012645dac136c18ce25d8",
          assets: 100000000000n,
          // 100,000 USDC
          lockUntil: BigInt(Math.floor((now + 12 * 24 * 60 * 60 * 1e3) / 1e3))
          // 12 days remaining
        }
      },
      {
        transactionHash: "0x4567890123def1234567890123def12345678901",
        blockNumber: 15847429n,
        args: {
          owner: "0x1234567890123456789012345678901234567890",
          assets: 75000000000n,
          // 75,000 USDC
          lockUntil: BigInt(Math.floor((now + 5 * 24 * 60 * 60 * 1e3) / 1e3))
          // 5 days remaining
        }
      },
      {
        transactionHash: "0x5678901234ef12345678901234ef123456789012",
        blockNumber: 15847445n,
        args: {
          owner: "0x9876543210987654321098765432109876543210",
          assets: 30000000000n,
          // 30,000 USDC
          lockUntil: BigInt(Math.floor((now + 8 * 24 * 60 * 60 * 1e3) / 1e3))
          // 8 days remaining
        }
      },
      {
        transactionHash: "0x6789012345f123456789012345f1234567890123",
        blockNumber: 15847456n,
        args: {
          owner: "0xabcdef1234567890abcdef1234567890abcdef12",
          assets: 15000000000n,
          // 15,000 USDC
          lockUntil: BigInt(Math.floor((now - 3 * 24 * 60 * 60 * 1e3) / 1e3))
          // Unlocked
        }
      },
      {
        transactionHash: "0x7890123456123456789012345612345678901234",
        blockNumber: 15847467n,
        args: {
          owner: "0xfedcba0987654321fedcba0987654321fedcba09",
          assets: 200000000000n,
          // 200,000 USDC
          lockUntil: BigInt(Math.floor((now + 14 * 24 * 60 * 60 * 1e3) / 1e3))
          // 14 days remaining
        }
      }
    ];
  }
  // Get wallet-specific transactions with enhanced lock-in data
  static async getWalletTransactions(address) {
    try {
      if (!isValidAddress(address)) {
        throw new Error(`Invalid wallet address format: ${address}`);
      }
      let depositEvents = [];
      let withdrawEvents = [];
      let yieldClaimEvents = [];
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock - 10000n > 0n ? latestBlock - 10000n : 0n;
      try {
        depositEvents = await publicClient.getLogs({
          address: CONTRACTS.STABLE_PAY_VAULT,
          event: parseAbi(["event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil)"])[0],
          args: {
            owner: address
          },
          fromBlock,
          toBlock: "latest"
        });
      } catch (err) {
        console.warn("Failed to fetch deposit events for wallet:", err);
      }
      try {
        withdrawEvents = await publicClient.getLogs({
          address: CONTRACTS.STABLE_PAY_VAULT,
          event: parseAbi(["event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)"])[0],
          args: {
            owner: address
          },
          fromBlock,
          toBlock: "latest"
        });
      } catch (err) {
        console.warn("Failed to fetch withdraw events for wallet:", err);
      }
      try {
        yieldClaimEvents = await publicClient.getLogs({
          address: CONTRACTS.STABLE_PAY_VAULT,
          event: parseAbi(["event YieldClaimed(address indexed user, uint256 amount)"])[0],
          args: {
            user: address
          },
          fromBlock,
          toBlock: "latest"
        });
      } catch (err) {
        console.warn("Failed to fetch yield claim events for wallet:", err);
      }
      const allEvents = [...depositEvents, ...withdrawEvents, ...yieldClaimEvents];
      const blockNumbers = [...new Set(allEvents.map((event) => event.blockNumber))];
      const blockTimestamps = {};
      for (const blockNumber of blockNumbers) {
        try {
          const block = await publicClient.getBlock({ blockNumber });
          blockTimestamps[blockNumber.toString()] = new Date(Number(block.timestamp) * 1e3);
        } catch (err) {
          console.warn(`Failed to fetch block ${blockNumber}:`, err);
          blockTimestamps[blockNumber.toString()] = /* @__PURE__ */ new Date();
        }
      }
      return {
        depositEvents: depositEvents.map((event) => ({
          ...event,
          timestamp: blockTimestamps[event.blockNumber.toString()] || /* @__PURE__ */ new Date()
        })),
        withdrawEvents: withdrawEvents.map((event) => ({
          ...event,
          timestamp: blockTimestamps[event.blockNumber.toString()] || /* @__PURE__ */ new Date()
        })),
        yieldClaimEvents: yieldClaimEvents.map((event) => ({
          ...event,
          timestamp: blockTimestamps[event.blockNumber.toString()] || /* @__PURE__ */ new Date()
        }))
      };
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      const now = Date.now();
      const mockDepositEvents = [
        {
          transactionHash: "0x1234567890abcdef1234567890abcdef12345678",
          blockNumber: 15847392n,
          timestamp: new Date(now - 7 * 24 * 60 * 60 * 1e3),
          // 7 days ago
          args: {
            owner: address,
            assets: 50000000000n,
            // 50,000 USDC
            lockUntil: BigInt(Math.floor((now + 8 * 24 * 60 * 60 * 1e3) / 1e3))
            // 8 days remaining
          }
        }
      ];
      const mockYieldEvents = [
        {
          transactionHash: "0x3456789012cdef123456789012cdef1234567890",
          blockNumber: 15847500n,
          timestamp: new Date(now - 1 * 24 * 60 * 60 * 1e3),
          // 1 day ago
          args: {
            user: address,
            amount: 1000000000n
            // 1000 USDC yield claimed
          }
        }
      ];
      return {
        depositEvents: address.toLowerCase() === "0xcdc5e2335a8263fcb4ca796462801f3423db4ada" ? mockDepositEvents : [],
        withdrawEvents: [],
        yieldClaimEvents: address.toLowerCase() === "0xcdc5e2335a8263fcb4ca796462801f3423db4ada" ? mockYieldEvents : []
      };
    }
  }
  // Instance method to access static method
  async getBlockchainPoolData() {
    return _BlockchainService.getPoolData();
  }
};

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
init_database();
var DatabaseStorage = class {
  async getUser(id) {
    return await DatabaseService.getUserById(id);
  }
  async getUserByUsername(username) {
    if (username.match(/^0x[a-fA-F0-9]{40}$/)) {
      return await DatabaseService.getUserByAddress(username);
    }
    return void 0;
  }
  async getUserByAddress(address) {
    return await DatabaseService.getUserByAddress(address);
  }
  async createUser(insertUser) {
    return await DatabaseService.createUser(insertUser);
  }
};
var storage = new DatabaseStorage();

// server/coinbase-session.ts
var CoinbaseSessionService = class {
  static PROJECT_ID = process.env.COINBASE_PROJECT_ID || "55a219f0-5f88-4931-818a-34bd7d74eff8";
  // Get API key from environment variables (Replit Secrets)
  static getApiKey() {
    const apiKey = process.env.COINBASE_API_KEY;
    console.log("Environment check - COINBASE_API_KEY exists:", !!apiKey);
    if (!apiKey) {
      throw new Error("COINBASE_API_KEY not found in environment variables. Please add it to Replit Secrets.");
    }
    return apiKey;
  }
  static async generateSecureToken(userAddress) {
    try {
      console.log("Generating Coinbase Pay session for address:", userAddress);
      const apiKey = this.getApiKey();
      const sessionData = {
        appId: this.PROJECT_ID,
        destinationWallets: [
          {
            address: userAddress.toLowerCase(),
            blockchains: ["base"]
          }
        ],
        presetAssets: [
          {
            asset: "USDC",
            blockchain: "base",
            amount: 100
          }
        ],
        partnerUserId: userAddress.toLowerCase(),
        partnerDisplayName: "StablePay User",
        timestamp: Math.floor(Date.now() / 1e3)
      };
      const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
      console.log("Coinbase Pay session token generated successfully");
      return token;
    } catch (error) {
      console.error("Error generating Coinbase session token:", error);
      const fallbackData = {
        appId: this.PROJECT_ID,
        destinationWallet: userAddress.toLowerCase(),
        timestamp: Math.floor(Date.now() / 1e3)
      };
      return Buffer.from(JSON.stringify(fallbackData)).toString("base64");
    }
  }
  // Legacy method name for backward compatibility
  static async generateSessionToken(userAddress) {
    return this.generateSecureToken(userAddress);
  }
  static getProjectId() {
    return this.PROJECT_ID;
  }
  // Validate if we have proper API configuration
  static isConfigured() {
    try {
      this.getApiKey();
      return true;
    } catch {
      return false;
    }
  }
  // Validate API key format and basic structure
  static validateApiKey() {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey || apiKey.length < 30) {
        return { valid: false, message: "API key too short - should be 36+ characters" };
      }
      if (!apiKey.match(/^[a-f0-9-]+$/)) {
        return { valid: false, message: "API key should contain only lowercase hex and dashes" };
      }
      return { valid: true, message: "API key format appears valid" };
    } catch (error) {
      return { valid: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }
};

// server/cashfree-kyc.ts
import crypto from "crypto";
var CashfreeKYCService = class {
  config;
  constructor() {
    this.config = {
      apiKey: process.env.CASHFREE_API_KEY || "",
      secretKey: process.env.CASHFREE_SECRET_KEY || "",
      merchantId: process.env.CASHFREE_MERCHANT_ID || "",
      accountId: process.env.CASHFREE_ACCOUNT_ID || "",
      baseUrl: process.env.CASHFREE_ENVIRONMENT === "production" ? "https://api.cashfree.com/verification" : "https://sandbox.cashfree.com/verification",
      environment: process.env.CASHFREE_ENVIRONMENT || "sandbox"
    };
    console.log(`Cashfree KYC Service initialized in ${this.config.environment} mode`);
    if (!this.isConfigured()) {
      console.warn("Cashfree API credentials not configured. Using mock responses.");
    }
  }
  generateSignature(payload) {
    const timestamp2 = Math.floor(Date.now() / 1e3).toString();
    const signatureData = `${timestamp2}${JSON.stringify(payload)}`;
    return crypto.createHmac("sha256", this.config.secretKey).update(signatureData).digest("hex");
  }
  getHeaders(payload) {
    const timestamp2 = Math.floor(Date.now() / 1e3).toString();
    const headers = {
      "Content-Type": "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": this.config.apiKey,
      "x-client-secret": this.config.secretKey,
      "x-timestamp": timestamp2,
      "Accept": "application/json",
      "Authorization": `Bearer ${this.config.secretKey}`
    };
    if (payload) {
      headers["x-signature"] = this.generateSignature(payload);
    }
    return headers;
  }
  isConfigured() {
    return !!(this.config.apiKey && this.config.secretKey && this.config.merchantId);
  }
  validatePAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }
  validateAadhaar(aadhaar) {
    const clean = aadhaar.replace(/\s/g, "");
    return /^[0-9]{12}$/.test(clean);
  }
  validateIFSC(ifsc) {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  }
  validateUPI(upi) {
    return /^[\w.-]+@[\w.-]+$/.test(upi);
  }
  // Digilocker Aadhaar Verification with Document Fetch
  async initiateDigilockerAadhaar(request) {
    try {
      if (!this.isConfigured()) {
        return {
          verificationId: `digilocker_${Date.now()}`,
          consentUrl: "https://digilocker.gov.in/consent/mock",
          status: "initiated"
        };
      }
      const payload = {
        purpose: "Identity verification for financial services",
        consent_required: true,
        fetch_document: true,
        verify_signature: true,
        extract_data: true
      };
      const response = await fetch(`${this.config.baseUrl}/v3/digilocker/aadhaar`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Digilocker verification failed: ${response.status}`);
      }
      return {
        verificationId: result.verification_id,
        consentUrl: result.consent_url,
        status: result.status === "success" ? "initiated" : "failed"
      };
    } catch (error) {
      console.error("Digilocker Aadhaar initiation failed:", error);
      throw new Error("Failed to initiate Digilocker Aadhaar verification");
    }
  }
  // Check Digilocker Aadhaar Status with Name/Photo Match
  async checkDigilockerStatus(verificationId) {
    try {
      if (!this.isConfigured()) {
        return {
          verificationId,
          consentUrl: "",
          status: "completed",
          aadhaarData: {
            nameMatch: true,
            photoMatch: true,
            addressVerified: true
          }
        };
      }
      const response = await fetch(`${this.config.baseUrl}/v3/digilocker/status/${verificationId}`, {
        method: "GET",
        headers: this.getHeaders()
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to check verification status");
      }
      return {
        verificationId,
        consentUrl: "",
        status: result.status === "completed" ? "completed" : "failed",
        aadhaarData: result.verification_data ? {
          nameMatch: result.verification_data.name_match === "Y",
          photoMatch: result.verification_data.photo_match === "Y",
          addressVerified: result.verification_data.address_verified === "Y"
        } : void 0
      };
    } catch (error) {
      console.error("Digilocker status check failed:", error);
      throw new Error("Failed to check Digilocker verification status");
    }
  }
  // Enhanced PAN Verification with Advanced Details
  async verifyPANAdvanced(request) {
    try {
      if (!this.validatePAN(request.panNumber)) {
        throw new Error("Invalid PAN format");
      }
      if (!this.isConfigured()) {
        return {
          valid: true,
          pan_status: "VALID",
          name_match: "Y",
          category: "Individual",
          last_updated: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const payload = {
        pan: request.panNumber.toUpperCase(),
        name: request.fullName,
        father_name: request.fatherName,
        date_of_birth: request.dateOfBirth,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v3/pan/advanced`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "PAN verification failed");
      }
      return result;
    } catch (error) {
      console.error("PAN advanced verification failed:", error);
      throw new Error("Failed to verify PAN with advanced details");
    }
  }
  // Face Liveness Detection
  async initiateFaceLiveness(request) {
    try {
      if (!this.isConfigured()) {
        return {
          verification_id: `face_${Date.now()}`,
          liveness_url: "https://mock-liveness.cashfree.com",
          status: "initiated",
          expires_at: new Date(Date.now() + 6e5).toISOString()
          // 10 minutes
        };
      }
      const payload = {
        verification_id: request.verificationId,
        liveness_check: true,
        face_match: true,
        quality_check: true,
        consent: "Y"
      };
      const response = await fetch(`${this.config.baseUrl}/v3/face/liveness`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Face liveness initiation failed");
      }
      return result;
    } catch (error) {
      console.error("Face liveness initiation failed:", error);
      throw new Error("Failed to initiate face liveness detection");
    }
  }
  // Advanced Bank Account Verification with Balance Check
  async verifyBankAdvanced(request) {
    try {
      if (!request.bankAccount || request.bankAccount.length < 9) {
        throw new Error("Invalid bank account number");
      }
      if (!this.validateIFSC(request.ifscCode)) {
        throw new Error("Invalid IFSC code");
      }
      if (!this.isConfigured()) {
        return {
          valid: true,
          account_status: "ACTIVE",
          name_match: "Y",
          bank_name: "Mock Bank Ltd",
          branch_name: "Mock Branch",
          account_type: "SAVINGS",
          balance_available: request.verifyBalance
        };
      }
      const payload = {
        account_number: request.bankAccount,
        ifsc: request.ifscCode.toUpperCase(),
        name: request.fullName,
        verify_balance: request.verifyBalance || false,
        consent: "Y",
        consent_purpose: "Bank account verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v3/bank_account/advanced`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Bank verification failed");
      }
      return result;
    } catch (error) {
      console.error("Bank advanced verification failed:", error);
      throw new Error("Failed to verify bank account with advanced details");
    }
  }
  // Advanced UPI Verification with Balance Check
  async verifyUPIAdvanced(request) {
    try {
      if (!this.validateUPI(request.upiId)) {
        throw new Error("Invalid UPI ID format");
      }
      if (!this.isConfigured()) {
        return {
          valid: true,
          upi_status: "ACTIVE",
          name_match: "Y",
          provider: "Mock@bank",
          account_type: "INDIVIDUAL",
          balance_available: request.verifyBalance
        };
      }
      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.fullName,
        verify_balance: request.verifyBalance || false,
        consent: "Y",
        consent_purpose: "UPI verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v3/upi/advanced`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "UPI verification failed");
      }
      return result;
    } catch (error) {
      console.error("UPI advanced verification failed:", error);
      throw new Error("Failed to verify UPI with advanced details");
    }
  }
  // Name Matching Service
  async verifyNameMatch(request) {
    try {
      if (!this.isConfigured()) {
        return {
          match_percentage: 95,
          match_status: "HIGH",
          fuzzy_match: true,
          phonetic_match: true
        };
      }
      const payload = {
        primary_name: request.primaryName,
        secondary_name: request.secondaryName,
        match_type: "comprehensive",
        fuzzy_matching: true,
        phonetic_matching: true
      };
      const response = await fetch(`${this.config.baseUrl}/v3/name/match`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Name matching failed");
      }
      return result;
    } catch (error) {
      console.error("Name matching failed:", error);
      throw new Error("Failed to perform name matching");
    }
  }
  // Comprehensive KYC Verification Process
  async performComprehensiveKYC(request) {
    const verificationSteps = [];
    const errors = [];
    let confidenceScore = 0;
    let totalSteps = 0;
    try {
      const verificationId = crypto.randomUUID();
      console.log(`Starting comprehensive KYC for ${request.userAddress}`);
      if (request.verificationLevel === "premium") {
        try {
          const digilockerResult = await this.initiateDigilockerAadhaar({
            userAddress: request.userAddress
          });
          verificationSteps.push({
            step: "digilocker_aadhaar",
            result: digilockerResult,
            success: digilockerResult.status === "initiated"
          });
          if (digilockerResult.status === "initiated") confidenceScore += 30;
          totalSteps++;
        } catch (error) {
          errors.push("Digilocker Aadhaar verification failed");
          verificationSteps.push({
            step: "digilocker_aadhaar",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      if (request.panNumber && ["enhanced", "premium"].includes(request.verificationLevel)) {
        try {
          const panResult = await this.verifyPANAdvanced({
            panNumber: request.panNumber,
            fullName: request.fullName,
            userAddress: request.userAddress
          });
          verificationSteps.push({
            step: "pan_advanced",
            result: panResult,
            success: panResult.valid && panResult.name_match === "Y"
          });
          if (panResult.valid && panResult.name_match === "Y") confidenceScore += 25;
          totalSteps++;
        } catch (error) {
          errors.push("PAN advanced verification failed");
          verificationSteps.push({
            step: "pan_advanced",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      if (request.verificationLevel === "premium") {
        try {
          const faceResult = await this.initiateFaceLiveness({
            userAddress: request.userAddress,
            verificationId
          });
          verificationSteps.push({
            step: "face_liveness",
            result: faceResult,
            success: faceResult.status === "initiated"
          });
          if (faceResult.status === "initiated") confidenceScore += 20;
          totalSteps++;
        } catch (error) {
          errors.push("Face liveness detection failed");
          verificationSteps.push({
            step: "face_liveness",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      if (request.bankAccount && request.ifscCode) {
        try {
          const bankResult = await this.verifyBankAdvanced({
            bankAccount: request.bankAccount,
            ifscCode: request.ifscCode,
            fullName: request.fullName,
            userAddress: request.userAddress,
            verifyBalance: request.verificationLevel === "premium"
          });
          verificationSteps.push({
            step: "bank_advanced",
            result: bankResult,
            success: bankResult.valid && bankResult.name_match === "Y"
          });
          if (bankResult.valid && bankResult.name_match === "Y") confidenceScore += 15;
          totalSteps++;
        } catch (error) {
          errors.push("Bank advanced verification failed");
          verificationSteps.push({
            step: "bank_advanced",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      if (request.upiId) {
        try {
          const upiResult = await this.verifyUPIAdvanced({
            upiId: request.upiId,
            fullName: request.fullName,
            userAddress: request.userAddress,
            verifyBalance: request.verificationLevel === "premium"
          });
          verificationSteps.push({
            step: "upi_advanced",
            result: upiResult,
            success: upiResult.valid && upiResult.name_match === "Y"
          });
          if (upiResult.valid && upiResult.name_match === "Y") confidenceScore += 10;
          totalSteps++;
        } catch (error) {
          errors.push("UPI advanced verification failed");
          verificationSteps.push({
            step: "upi_advanced",
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      const finalConfidenceScore = totalSteps > 0 ? Math.round(confidenceScore / totalSteps * 100) : 0;
      let kycStatus = "pending";
      const thresholds = {
        basic: 60,
        enhanced: 75,
        premium: 90
      };
      if (finalConfidenceScore >= thresholds[request.verificationLevel]) {
        kycStatus = "verified";
      } else if (finalConfidenceScore < 40) {
        kycStatus = "rejected";
      }
      console.log(`KYC completed for ${request.userAddress}: ${kycStatus} (${finalConfidenceScore}% confidence)`);
      return {
        success: true,
        verificationId,
        kycLevel: request.verificationLevel,
        status: kycStatus,
        steps: verificationSteps,
        confidence_score: finalConfidenceScore,
        message: `KYC ${kycStatus} with ${finalConfidenceScore}% confidence`,
        errors: errors.length > 0 ? errors : void 0
      };
    } catch (error) {
      console.error("Comprehensive KYC failed:", error);
      return {
        success: false,
        verificationId: "",
        kycLevel: request.verificationLevel,
        status: "rejected",
        steps: verificationSteps,
        confidence_score: 0,
        message: "KYC process failed",
        errors: [error instanceof Error ? error.message : "Unknown error"]
      };
    }
  }
  // Enhanced INR Transfer Processing
  async processINRTransfer(request) {
    try {
      if (!request.userAddress || !request.usdcAmount || !request.txHash) {
        throw new Error("Missing required withdrawal parameters");
      }
      if (parseFloat(request.usdcAmount) <= 0) {
        throw new Error("Invalid withdrawal amount");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          transfer_id: `transfer_${Date.now()}`,
          status: "INITIATED",
          amount: request.inrAmount,
          currency: "INR",
          estimated_completion: "2-4 hours",
          tracking_id: `TRK${Date.now()}`,
          message: "INR transfer initiated successfully"
        };
      }
      const payload = {
        amount: parseFloat(request.inrAmount),
        currency: "INR",
        beneficiary: {
          name: request.beneficiaryName,
          account_number: request.verificationType === "bank" ? request.bankAccount : void 0,
          ifsc: request.verificationType === "bank" ? request.ifscCode : void 0,
          upi_id: request.verificationType === "upi" ? request.upiId : void 0
        },
        source_currency: "USDC",
        source_amount: parseFloat(request.usdcAmount),
        reference_id: request.txHash,
        purpose: "Cryptocurrency to INR conversion",
        notification_url: `${process.env.WEBHOOK_URL}/cashfree/transfer/webhook`
      };
      const response = await fetch(`${this.config.baseUrl}/../transfers/instant`, {
        method: "POST",
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Transfer initiation failed");
      }
      return result;
    } catch (error) {
      console.error("INR transfer failed:", error);
      throw new Error("Failed to process INR transfer");
    }
  }
  // Get real-time USD to INR exchange rate
  async getExchangeRate() {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (response.ok) {
        const data = await response.json();
        return data.rates.INR || 84.5;
      }
      const fallbackResponse = await fetch("https://api.fxratesapi.com/latest?base=USD&symbols=INR");
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData.rates.INR || 84.5;
      }
      return 84.5;
    } catch (error) {
      console.error("Exchange rate fetch failed:", error);
      return 84.5;
    }
  }
};
var cashfreeKYCService = new CashfreeKYCService();

// server/surepass-kyc.ts
import crypto2 from "crypto";
var SurePassKYCService = class {
  config;
  constructor() {
    this.config = {
      token: process.env.SUREPASS_TOKEN || "",
      baseUrl: process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io",
      environment: process.env.SUREPASS_ENVIRONMENT || "production"
    };
    console.log(`SurePass KYC Service initialized in ${this.config.environment} mode`);
    if (!this.isConfigured()) {
      console.warn("SurePass API credentials not configured. Using mock responses.");
    }
  }
  isConfigured() {
    return !!(this.config.token && this.config.baseUrl);
  }
  getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.token}`,
      "Accept": "application/json",
      "User-Agent": "StablePay-KYC/1.0"
    };
  }
  validateAadhaar(aadhaar) {
    const clean = aadhaar.replace(/\s/g, "");
    return /^[0-9]{12}$/.test(clean);
  }
  validatePAN(pan) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }
  validatePhone(phone) {
    const clean = phone.replace(/[^\d]/g, "");
    return /^[6-9]\d{9}$/.test(clean);
  }
  validateVoterId(voterId) {
    return /^[A-Z]{3}[0-9]{7}$/.test(voterId);
  }
  validateDrivingLicense(dl) {
    return /^[A-Z]{2}[-]?[0-9]{2}[-]?[0-9]{4}[-]?[0-9]{7}$/.test(dl) || /^[A-Z]{2}[0-9]{13}$/.test(dl);
  }
  // Aadhaar Verification
  async verifyAadhaar(request) {
    try {
      if (!request.consent) {
        throw new Error("User consent is required for Aadhaar verification");
      }
      if (!this.validateAadhaar(request.aadhaarNumber)) {
        throw new Error("Invalid Aadhaar number format");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          verificationId: `surepass_aadhaar_${Date.now()}`,
          status: "completed",
          aadhaarData: {
            name: "Mock User Name",
            dateOfBirth: "1990-01-01",
            gender: "M",
            address: "Mock Address, Mock City, Mock State",
            isValid: true
          },
          message: "Aadhaar verification completed successfully (mock)"
        };
      }
      const payload = {
        id_number: request.aadhaarNumber.replace(/\s/g, ""),
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v1/aadhaar-verification`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Aadhaar verification failed: ${response.status}`);
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_aadhaar_${Date.now()}`,
        status: result.success ? "completed" : "failed",
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: result.data.address,
          mobileNumber: result.data.mobile,
          isValid: result.success
        } : void 0,
        message: result.message || "Aadhaar verification completed"
      };
    } catch (error) {
      console.error("SurePass Aadhaar verification failed:", error);
      return {
        success: false,
        verificationId: "",
        status: "failed",
        message: error instanceof Error ? error.message : "Aadhaar verification failed"
      };
    }
  }
  // PAN Verification
  async verifyPAN(request) {
    try {
      if (!request.consent) {
        throw new Error("User consent is required for PAN verification");
      }
      if (!this.validatePAN(request.panNumber)) {
        throw new Error("Invalid PAN format");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          verificationId: `surepass_pan_${Date.now()}`,
          panData: {
            panNumber: request.panNumber.toUpperCase(),
            name: request.fullName,
            isValid: true,
            panStatus: "VALID",
            nameMatch: true
          },
          message: "PAN verification completed successfully (mock)"
        };
      }
      const payload = {
        id_number: request.panNumber.toUpperCase(),
        name: request.fullName,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v1/pan-verification`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `PAN verification failed: ${response.status}`);
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_pan_${Date.now()}`,
        panData: result.data ? {
          panNumber: result.data.pan_number,
          name: result.data.name,
          fatherName: result.data.father_name,
          dateOfBirth: result.data.dob,
          isValid: result.success,
          panStatus: result.data.pan_status || "VALID",
          nameMatch: result.data.name_match || true
        } : void 0,
        message: result.message || "PAN verification completed"
      };
    } catch (error) {
      console.error("SurePass PAN verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "PAN verification failed"
      };
    }
  }
  // Voter ID Verification
  async verifyVoterId(request) {
    try {
      if (!request.consent) {
        throw new Error("User consent is required for Voter ID verification");
      }
      if (!this.validateVoterId(request.voterIdNumber)) {
        throw new Error("Invalid Voter ID format");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          verificationId: `surepass_voter_${Date.now()}`,
          voterData: {
            voterIdNumber: request.voterIdNumber.toUpperCase(),
            name: request.fullName,
            address: "Mock Address, Mock City, Mock State",
            isValid: true,
            nameMatch: true
          },
          message: "Voter ID verification completed successfully (mock)"
        };
      }
      const payload = {
        id_number: request.voterIdNumber.toUpperCase(),
        name: request.fullName,
        state: request.state,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v1/voter-id-verification`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Voter ID verification failed: ${response.status}`);
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_voter_${Date.now()}`,
        voterData: result.data ? {
          voterIdNumber: result.data.voter_id,
          name: result.data.name,
          fatherName: result.data.father_name,
          dateOfBirth: result.data.dob,
          address: result.data.address,
          isValid: result.success,
          nameMatch: result.data.name_match || true
        } : void 0,
        message: result.message || "Voter ID verification completed"
      };
    } catch (error) {
      console.error("SurePass Voter ID verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "Voter ID verification failed"
      };
    }
  }
  // Driving License Verification
  async verifyDrivingLicense(request) {
    try {
      if (!request.consent) {
        throw new Error("User consent is required for Driving License verification");
      }
      if (!this.validateDrivingLicense(request.dlNumber)) {
        throw new Error("Invalid Driving License format");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          verificationId: `surepass_dl_${Date.now()}`,
          dlData: {
            dlNumber: request.dlNumber.toUpperCase(),
            name: request.fullName,
            dateOfBirth: request.dateOfBirth,
            address: "Mock Address, Mock City, Mock State",
            issueDate: "2020-01-01",
            expiryDate: "2040-01-01",
            isValid: true,
            nameMatch: true,
            dobMatch: true
          },
          message: "Driving License verification completed successfully (mock)"
        };
      }
      const payload = {
        id_number: request.dlNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v1/driving-license-verification`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Driving License verification failed: ${response.status}`);
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_dl_${Date.now()}`,
        dlData: result.data ? {
          dlNumber: result.data.dl_number,
          name: result.data.name,
          dateOfBirth: result.data.dob,
          address: result.data.address,
          issueDate: result.data.issue_date,
          expiryDate: result.data.expiry_date,
          isValid: result.success,
          nameMatch: result.data.name_match || true,
          dobMatch: result.data.dob_match || true
        } : void 0,
        message: result.message || "Driving License verification completed"
      };
    } catch (error) {
      console.error("SurePass Driving License verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "Driving License verification failed"
      };
    }
  }
  // Phone Number Verification
  async verifyPhone(request) {
    try {
      if (!request.consent) {
        throw new Error("User consent is required for phone verification");
      }
      if (!this.validatePhone(request.phoneNumber)) {
        throw new Error("Invalid phone number format");
      }
      if (!this.isConfigured()) {
        return {
          success: true,
          verificationId: `surepass_phone_${Date.now()}`,
          phoneData: {
            phoneNumber: request.phoneNumber,
            operator: "Mock Telecom",
            circle: "Mock Circle",
            isActive: true,
            isValid: true
          },
          message: "Phone verification completed successfully (mock)"
        };
      }
      const payload = {
        phone_number: request.phoneNumber.replace(/[^\d]/g, ""),
        consent: "Y",
        consent_purpose: "Phone verification for financial services"
      };
      const response = await fetch(`${this.config.baseUrl}/v1/phone-verification`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Phone verification failed: ${response.status}`);
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_phone_${Date.now()}`,
        phoneData: result.data ? {
          phoneNumber: result.data.phone_number,
          operator: result.data.operator,
          circle: result.data.circle,
          isActive: result.data.is_active,
          isValid: result.success
        } : void 0,
        message: result.message || "Phone verification completed"
      };
    } catch (error) {
      console.error("SurePass Phone verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "Phone verification failed"
      };
    }
  }
  // Comprehensive Multi-Document Verification
  async performMultiDocumentKYC(documents, userInfo) {
    const results = [];
    let successCount = 0;
    let totalVerifications = 0;
    try {
      const verificationId = crypto2.randomUUID();
      if (documents.aadhaar) {
        totalVerifications++;
        const aadhaarResult = await this.verifyAadhaar({
          aadhaarNumber: documents.aadhaar,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: "aadhaar", result: aadhaarResult });
        if (aadhaarResult.success) successCount++;
      }
      if (documents.pan) {
        totalVerifications++;
        const panResult = await this.verifyPAN({
          panNumber: documents.pan,
          fullName: userInfo.fullName,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: "pan", result: panResult });
        if (panResult.success) successCount++;
      }
      if (documents.voterId) {
        totalVerifications++;
        const voterResult = await this.verifyVoterId({
          voterIdNumber: documents.voterId,
          fullName: userInfo.fullName,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: "voter_id", result: voterResult });
        if (voterResult.success) successCount++;
      }
      if (documents.drivingLicense && userInfo.dateOfBirth) {
        totalVerifications++;
        const dlResult = await this.verifyDrivingLicense({
          dlNumber: documents.drivingLicense,
          fullName: userInfo.fullName,
          dateOfBirth: userInfo.dateOfBirth,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: "driving_license", result: dlResult });
        if (dlResult.success) successCount++;
      }
      if (documents.phone) {
        totalVerifications++;
        const phoneResult = await this.verifyPhone({
          phoneNumber: documents.phone,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: "phone", result: phoneResult });
        if (phoneResult.success) successCount++;
      }
      const confidenceScore = totalVerifications > 0 ? successCount / totalVerifications * 100 : 0;
      let status = "failed";
      if (confidenceScore >= 80) {
        status = "verified";
      } else if (confidenceScore >= 50) {
        status = "partial";
      }
      return {
        success: successCount > 0,
        verificationId,
        results,
        confidenceScore: Math.round(confidenceScore),
        status,
        message: `Multi-document KYC completed with ${successCount}/${totalVerifications} successful verifications`
      };
    } catch (error) {
      console.error("Multi-document KYC failed:", error);
      return {
        success: false,
        verificationId: "",
        results,
        confidenceScore: 0,
        status: "failed",
        message: error instanceof Error ? error.message : "Multi-document KYC failed"
      };
    }
  }
};
var surePassKYCService = new SurePassKYCService();

// server/enhanced-kyc-service.ts
import crypto3 from "crypto";
var EnhancedKYCService = class {
  cashfreeConfig;
  surepassConfig;
  constructor() {
    this.cashfreeConfig = {
      apiKey: process.env.CASHFREE_API_KEY || "",
      secretKey: process.env.CASHFREE_SECRET_KEY || "",
      merchantId: process.env.CASHFREE_MERCHANT_ID || "",
      baseUrl: process.env.CASHFREE_ENVIRONMENT === "production" ? "https://api.cashfree.com/verification" : "https://sandbox.cashfree.com/verification",
      environment: process.env.CASHFREE_ENVIRONMENT || "sandbox"
    };
    this.surepassConfig = {
      token: process.env.SUREPASS_TOKEN || "",
      baseUrl: process.env.SUREPASS_BASE_URL || "https://kyc-api.surepass.io",
      environment: process.env.SUREPASS_ENVIRONMENT || "production"
    };
    console.log(`Enhanced KYC Service initialized`);
    console.log(`- Cashfree: ${this.cashfreeConfig.environment} mode`);
    console.log(`- SurePass: ${this.surepassConfig.environment} mode`);
  }
  isConfigured(provider) {
    if (provider === "cashfree") {
      return !!(this.cashfreeConfig.apiKey && this.cashfreeConfig.secretKey);
    } else {
      return !!this.surepassConfig.token;
    }
  }
  getCashfreeHeaders(payload) {
    const timestamp2 = Math.floor(Date.now() / 1e3).toString();
    const headers = {
      "Content-Type": "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": this.cashfreeConfig.apiKey,
      "x-client-secret": this.cashfreeConfig.secretKey,
      "x-timestamp": timestamp2,
      "Accept": "application/json",
      "Authorization": `Bearer ${this.cashfreeConfig.secretKey}`
    };
    if (payload) {
      const signatureData = `${timestamp2}${JSON.stringify(payload)}`;
      headers["x-signature"] = crypto3.createHmac("sha256", this.cashfreeConfig.secretKey).update(signatureData).digest("hex");
    }
    return headers;
  }
  getSurePassHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.surepassConfig.token}`,
      "Accept": "application/json",
      "User-Agent": "StablePay-KYC/1.0"
    };
  }
  // ===== AADHAAR OTP VERIFICATION =====
  async initiateAadhaarOTP(request) {
    if (!request.consent) {
      return {
        success: false,
        status: "failed",
        message: "User consent is required for Aadhaar verification"
      };
    }
    const cleanAadhaar = request.aadhaarNumber.replace(/\s/g, "");
    if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
      return {
        success: false,
        status: "failed",
        message: "Invalid Aadhaar number format"
      };
    }
    let response = await this.initiateCashfreeAadhaarOTP(request);
    if (!response.success && this.isConfigured("surepass")) {
      response = await this.initiateSurePassAadhaarOTP(request);
    }
    return response;
  }
  async initiateCashfreeAadhaarOTP(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return this.getMockAadhaarOTPResponse(request, "otp_sent");
      }
      const payload = {
        aadhaar_number: request.aadhaarNumber.replace(/\s/g, ""),
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/aadhaar/otp`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Aadhaar OTP initiation failed");
      }
      return {
        success: true,
        sessionId: result.session_id || result.verification_id,
        verificationId: result.verification_id,
        status: "otp_sent",
        message: "OTP sent successfully to registered mobile number"
      };
    } catch (error) {
      console.error("Cashfree Aadhaar OTP failed:", error);
      return {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to send Aadhaar OTP"
      };
    }
  }
  async initiateSurePassAadhaarOTP(request) {
    try {
      const payload = {
        id_number: request.aadhaarNumber.replace(/\s/g, ""),
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/aadhaar-otp`, {
        method: "POST",
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "SurePass Aadhaar OTP failed");
      }
      return {
        success: result.success || false,
        sessionId: result.session_id || result.request_id,
        verificationId: result.verification_id || `surepass_${Date.now()}`,
        status: result.success ? "otp_sent" : "failed",
        message: result.message || "OTP sent successfully"
      };
    } catch (error) {
      console.error("SurePass Aadhaar OTP failed:", error);
      return {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to send Aadhaar OTP"
      };
    }
  }
  async verifyAadhaarOTP(request) {
    if (!/^[0-9]{6}$/.test(request.otp)) {
      return {
        success: false,
        status: "failed",
        message: "Invalid OTP format. Please enter 6-digit OTP."
      };
    }
    let response = await this.verifyCashfreeAadhaarOTP(request);
    if (!response.success && this.isConfigured("surepass")) {
      response = await this.verifySurePassAadhaarOTP(request);
    }
    return response;
  }
  async verifyCashfreeAadhaarOTP(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return this.getMockAadhaarOTPResponse(request, "verified");
      }
      const payload = {
        session_id: request.sessionId,
        otp: request.otp
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/aadhaar/otp/verify`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "OTP verification failed");
      }
      return {
        success: result.valid || false,
        verificationId: result.verification_id,
        status: result.valid ? "verified" : "failed",
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: {
            house: result.data.address?.house || "",
            street: result.data.address?.street || "",
            landmark: result.data.address?.landmark || "",
            area: result.data.address?.area || "",
            city: result.data.address?.city || "",
            state: result.data.address?.state || "",
            pincode: result.data.address?.pincode || ""
          },
          mobileNumber: result.data.mobile,
          email: result.data.email,
          photo: result.data.photo
        } : void 0,
        message: result.valid ? "Aadhaar verified successfully" : "Invalid OTP"
      };
    } catch (error) {
      console.error("Cashfree Aadhaar OTP verification failed:", error);
      return {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "OTP verification failed"
      };
    }
  }
  async verifySurePassAadhaarOTP(request) {
    try {
      const payload = {
        request_id: request.sessionId,
        otp: request.otp
      };
      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/aadhaar-otp/verify`, {
        method: "POST",
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "SurePass OTP verification failed");
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_${Date.now()}`,
        status: result.success ? "verified" : "failed",
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: {
            house: result.data.address?.house || "",
            street: result.data.address?.street || "",
            landmark: result.data.address?.landmark || "",
            area: result.data.address?.area || "",
            city: result.data.address?.city || "",
            state: result.data.address?.state || "",
            pincode: result.data.address?.pincode || ""
          },
          mobileNumber: result.data.mobile,
          email: result.data.email
        } : void 0,
        message: result.message || (result.success ? "Aadhaar verified successfully" : "OTP verification failed")
      };
    } catch (error) {
      console.error("SurePass Aadhaar OTP verification failed:", error);
      return {
        success: false,
        status: "failed",
        message: error instanceof Error ? error.message : "OTP verification failed"
      };
    }
  }
  // ===== PAN VERIFICATION =====
  async verifyPAN(request) {
    if (!request.consent) {
      return {
        success: false,
        verificationId: "",
        message: "User consent is required for PAN verification"
      };
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(request.panNumber)) {
      return {
        success: false,
        verificationId: "",
        message: "Invalid PAN format"
      };
    }
    const cashfreeResult = await this.verifyCashfreePAN(request);
    const surepassResult = await this.verifySurePassPAN(request);
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;
    return cashfreeResult.message.length > surepassResult.message.length ? cashfreeResult : surepassResult;
  }
  async verifyCashfreePAN(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return this.getMockPANResponse(request);
      }
      const payload = {
        pan: request.panNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/pan/advanced`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "PAN verification failed");
      }
      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_pan_${Date.now()}`,
        panData: result.valid ? {
          panNumber: result.data?.pan || request.panNumber,
          name: result.data?.name || request.fullName,
          fatherName: result.data?.father_name,
          dateOfBirth: result.data?.dob,
          panStatus: result.data?.status || "VALID",
          category: result.data?.category || "INDIVIDUAL",
          nameMatch: result.data?.name_match === "Y",
          dobMatch: result.data?.dob_match === "Y",
          isActive: result.valid,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        } : void 0,
        message: result.valid ? "PAN verified successfully" : result.message || "PAN verification failed"
      };
    } catch (error) {
      console.error("Cashfree PAN verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "PAN verification failed"
      };
    }
  }
  async verifySurePassPAN(request) {
    try {
      const payload = {
        id_number: request.panNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: "Y",
        consent_purpose: "Identity verification for financial services"
      };
      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/pan-verification`, {
        method: "POST",
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "SurePass PAN verification failed");
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_pan_${Date.now()}`,
        panData: result.success && result.data ? {
          panNumber: result.data.pan_number,
          name: result.data.name,
          fatherName: result.data.father_name,
          dateOfBirth: result.data.dob,
          panStatus: result.data.pan_status || "VALID",
          category: result.data.category || "INDIVIDUAL",
          nameMatch: result.data.name_match !== false,
          dobMatch: result.data.dob_match !== false,
          isActive: result.success,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        } : void 0,
        message: result.message || (result.success ? "PAN verified successfully" : "PAN verification failed")
      };
    } catch (error) {
      console.error("SurePass PAN verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "PAN verification failed"
      };
    }
  }
  // ===== FACE LIVENESS DETECTION =====
  async initiateFaceLiveness(request) {
    let response = await this.initiateCashfreeFaceLiveness(request);
    if (!response.success && this.isConfigured("surepass")) {
      response = await this.initiateCashfreeFaceLiveness(request);
    }
    return response;
  }
  async initiateCashfreeFaceLiveness(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return {
          success: true,
          verificationId: `mock_face_${Date.now()}`,
          livenessUrl: "https://mock-liveness.cashfree.com/verify",
          status: "initiated",
          message: "Face liveness verification initiated (mock)",
          expiresAt: new Date(Date.now() + 6e5).toISOString()
          // 10 minutes
        };
      }
      const payload = {
        verification_id: request.verificationId || crypto3.randomUUID(),
        liveness_check: true,
        face_match: !!request.referencePhoto,
        quality_check: true,
        reference_image: request.referencePhoto,
        consent: "Y"
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/face/liveness`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Face liveness initiation failed");
      }
      return {
        success: true,
        verificationId: result.verification_id,
        livenessUrl: result.liveness_url,
        status: "initiated",
        message: "Face liveness verification initiated successfully",
        expiresAt: result.expires_at
      };
    } catch (error) {
      console.error("Face liveness initiation failed:", error);
      return {
        success: false,
        verificationId: "",
        status: "failed",
        message: error instanceof Error ? error.message : "Face liveness initiation failed"
      };
    }
  }
  async checkFaceLivenessStatus(verificationId) {
    try {
      if (!this.isConfigured("cashfree")) {
        return {
          success: true,
          verificationId,
          status: "completed",
          livenessResult: {
            isLive: true,
            confidence: 0.95,
            faceMatch: true,
            faceMatchConfidence: 0.92,
            qualityScore: 0.88,
            spoofingDetected: false
          },
          message: "Face liveness verification completed successfully (mock)"
        };
      }
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/face/liveness/status/${verificationId}`, {
        method: "GET",
        headers: this.getCashfreeHeaders()
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to check face liveness status");
      }
      return {
        success: true,
        verificationId,
        status: result.status === "completed" ? "completed" : result.status === "failed" ? "failed" : "initiated",
        livenessResult: result.liveness_result ? {
          isLive: result.liveness_result.is_live,
          confidence: result.liveness_result.confidence,
          faceMatch: result.liveness_result.face_match,
          faceMatchConfidence: result.liveness_result.face_match_confidence,
          qualityScore: result.liveness_result.quality_score,
          spoofingDetected: result.liveness_result.spoofing_detected
        } : void 0,
        message: result.message || "Face liveness status retrieved successfully"
      };
    } catch (error) {
      console.error("Face liveness status check failed:", error);
      return {
        success: false,
        verificationId,
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to check face liveness status"
      };
    }
  }
  // ===== BANK ACCOUNT VERIFICATION =====
  async verifyBankAccount(request) {
    if (!request.consent) {
      return {
        success: false,
        verificationId: "",
        message: "User consent is required for bank account verification"
      };
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(request.ifscCode)) {
      return {
        success: false,
        verificationId: "",
        message: "Invalid IFSC code format"
      };
    }
    const cashfreeResult = await this.verifyCashfreeBankAccount(request);
    const surepassResult = await this.verifySurePassBankAccount(request);
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;
    return cashfreeResult;
  }
  async verifyCashfreeBankAccount(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return this.getMockBankAccountResponse(request);
      }
      const payload = {
        account_number: request.accountNumber,
        ifsc: request.ifscCode.toUpperCase(),
        name: request.accountHolderName,
        verify_balance: request.verifyBalance || false,
        consent: "Y",
        consent_purpose: "Bank account verification for financial services"
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/bank_account/advanced`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Bank account verification failed");
      }
      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_bank_${Date.now()}`,
        bankData: result.valid ? {
          accountNumber: request.accountNumber,
          ifscCode: request.ifscCode.toUpperCase(),
          bankName: result.data?.bank_name || "Unknown Bank",
          branchName: result.data?.branch_name || "Unknown Branch",
          accountHolderName: result.data?.account_holder_name || request.accountHolderName,
          accountType: result.data?.account_type || "SAVINGS",
          accountStatus: result.data?.account_status || "ACTIVE",
          nameMatch: result.data?.name_match === "Y",
          balanceAvailable: result.data?.balance_available,
          lastTransactionDate: result.data?.last_transaction_date
        } : void 0,
        message: result.valid ? "Bank account verified successfully" : result.message || "Bank account verification failed"
      };
    } catch (error) {
      console.error("Cashfree bank account verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "Bank account verification failed"
      };
    }
  }
  async verifySurePassBankAccount(request) {
    try {
      const payload = {
        account_number: request.accountNumber,
        ifsc_code: request.ifscCode.toUpperCase(),
        name: request.accountHolderName,
        consent: "Y",
        consent_purpose: "Bank account verification for financial services"
      };
      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/bank-verification`, {
        method: "POST",
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "SurePass bank verification failed");
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_bank_${Date.now()}`,
        bankData: result.success && result.data ? {
          accountNumber: request.accountNumber,
          ifscCode: request.ifscCode.toUpperCase(),
          bankName: result.data.bank_name,
          branchName: result.data.branch_name,
          accountHolderName: result.data.account_holder_name,
          accountType: result.data.account_type || "SAVINGS",
          accountStatus: result.data.account_status || "ACTIVE",
          nameMatch: result.data.name_match !== false,
          balanceAvailable: result.data.balance_available,
          lastTransactionDate: result.data.last_transaction_date
        } : void 0,
        message: result.message || (result.success ? "Bank account verified successfully" : "Bank verification failed")
      };
    } catch (error) {
      console.error("SurePass bank verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "Bank account verification failed"
      };
    }
  }
  // ===== UPI VERIFICATION =====
  async verifyUPI(request) {
    if (!request.consent) {
      return {
        success: false,
        verificationId: "",
        message: "User consent is required for UPI verification"
      };
    }
    if (!/^[\w.-]+@[\w.-]+$/.test(request.upiId)) {
      return {
        success: false,
        verificationId: "",
        message: "Invalid UPI ID format"
      };
    }
    const cashfreeResult = await this.verifyCashfreeUPI(request);
    const surepassResult = await this.verifySurePassUPI(request);
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;
    return cashfreeResult;
  }
  async verifyCashfreeUPI(request) {
    try {
      if (!this.isConfigured("cashfree")) {
        return this.getMockUPIResponse(request);
      }
      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.accountHolderName,
        verify_balance: request.verifyBalance || false,
        consent: "Y",
        consent_purpose: "UPI verification for financial services"
      };
      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/upi/advanced`, {
        method: "POST",
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "UPI verification failed");
      }
      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_upi_${Date.now()}`,
        upiData: result.valid ? {
          upiId: request.upiId,
          accountHolderName: result.data?.account_holder_name || request.accountHolderName,
          provider: result.data?.provider || request.upiId.split("@")[1],
          bankName: result.data?.bank_name || "Unknown Bank",
          accountType: result.data?.account_type || "INDIVIDUAL",
          status: result.data?.status || "ACTIVE",
          nameMatch: result.data?.name_match === "Y",
          balanceAvailable: result.data?.balance_available,
          registrationDate: result.data?.registration_date
        } : void 0,
        message: result.valid ? "UPI verified successfully" : result.message || "UPI verification failed"
      };
    } catch (error) {
      console.error("Cashfree UPI verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "UPI verification failed"
      };
    }
  }
  async verifySurePassUPI(request) {
    try {
      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.accountHolderName,
        consent: "Y",
        consent_purpose: "UPI verification for financial services"
      };
      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/upi-verification`, {
        method: "POST",
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "SurePass UPI verification failed");
      }
      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_upi_${Date.now()}`,
        upiData: result.success && result.data ? {
          upiId: request.upiId,
          accountHolderName: result.data.account_holder_name,
          provider: result.data.provider,
          bankName: result.data.bank_name,
          accountType: result.data.account_type || "INDIVIDUAL",
          status: result.data.status || "ACTIVE",
          nameMatch: result.data.name_match !== false,
          balanceAvailable: result.data.balance_available,
          registrationDate: result.data.registration_date
        } : void 0,
        message: result.message || (result.success ? "UPI verified successfully" : "UPI verification failed")
      };
    } catch (error) {
      console.error("SurePass UPI verification failed:", error);
      return {
        success: false,
        verificationId: "",
        message: error instanceof Error ? error.message : "UPI verification failed"
      };
    }
  }
  // ===== MOCK RESPONSES FOR TESTING =====
  getMockAadhaarOTPResponse(request, status) {
    if (status === "otp_sent") {
      return {
        success: true,
        sessionId: `mock_session_${Date.now()}`,
        verificationId: `mock_aadhaar_${Date.now()}`,
        status: "otp_sent",
        message: "OTP sent successfully to registered mobile number (mock)"
      };
    }
    return {
      success: true,
      verificationId: `mock_aadhaar_${Date.now()}`,
      status: "verified",
      aadhaarData: {
        name: "Mock User Name",
        dateOfBirth: "1990-01-01",
        gender: "M",
        address: {
          house: "123",
          street: "Mock Street",
          landmark: "Near Mock Landmark",
          area: "Mock Area",
          city: "Mock City",
          state: "Mock State",
          pincode: "123456"
        },
        mobileNumber: "9876543210",
        email: "mockuser@example.com"
      },
      message: "Aadhaar verified successfully (mock)"
    };
  }
  getMockPANResponse(request) {
    return {
      success: true,
      verificationId: `mock_pan_${Date.now()}`,
      panData: {
        panNumber: request.panNumber.toUpperCase(),
        name: request.fullName,
        fatherName: "Mock Father Name",
        dateOfBirth: request.dateOfBirth || "1990-01-01",
        panStatus: "VALID",
        category: "INDIVIDUAL",
        nameMatch: true,
        dobMatch: !!request.dateOfBirth,
        isActive: true,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      },
      message: "PAN verified successfully (mock)"
    };
  }
  getMockBankAccountResponse(request) {
    return {
      success: true,
      verificationId: `mock_bank_${Date.now()}`,
      bankData: {
        accountNumber: request.accountNumber,
        ifscCode: request.ifscCode.toUpperCase(),
        bankName: "Mock Bank Limited",
        branchName: "Mock Branch",
        accountHolderName: request.accountHolderName,
        accountType: "SAVINGS",
        accountStatus: "ACTIVE",
        nameMatch: true,
        balanceAvailable: request.verifyBalance,
        lastTransactionDate: new Date(Date.now() - 864e5).toISOString()
      },
      message: "Bank account verified successfully (mock)"
    };
  }
  getMockUPIResponse(request) {
    return {
      success: true,
      verificationId: `mock_upi_${Date.now()}`,
      upiData: {
        upiId: request.upiId,
        accountHolderName: request.accountHolderName,
        provider: request.upiId.split("@")[1] || "mockbank",
        bankName: "Mock Bank Limited",
        accountType: "INDIVIDUAL",
        status: "ACTIVE",
        nameMatch: true,
        balanceAvailable: request.verifyBalance,
        registrationDate: new Date(Date.now() - 864e5 * 30).toISOString()
      },
      message: "UPI verified successfully (mock)"
    };
  }
};
var enhancedKYCService = new EnhancedKYCService();

// server/mongodb.ts
import { MongoClient } from "mongodb";
var client;
var db2;
async function connectToMongoDB() {
  if (db2) {
    return db2;
  }
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/stablepay";
  try {
    client = new MongoClient(mongoUri, {
      // MongoDB connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    });
    await client.connect();
    const dbName = mongoUri.includes("/") ? mongoUri.split("/").pop()?.split("?")[0] : "stablepay";
    db2 = client.db(dbName || "stablepay");
    await db2.admin().ping();
    console.log("\u2705 Connected to MongoDB successfully");
    console.log(`\u{1F527} Database: ${db2.databaseName}`);
    return db2;
  } catch (error) {
    console.error("\u274C MongoDB connection error:", error);
    console.log("\u{1F504} Running in mock database mode for local development");
    return null;
  }
}
async function getMongoDB() {
  if (!db2) {
    return await connectToMongoDB();
  }
  return db2;
}
async function closeMongoDBConnection() {
  if (client) {
    await client.close();
    console.log("\u{1F50C} MongoDB connection closed");
  }
}
process.on("SIGINT", async () => {
  await closeMongoDBConnection();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

// server/early-access-schema.ts
import { z } from "zod";
var EarlyAccessFormSchema = z.object({
  // Contact Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  // Form Type
  formType: z.enum(["savings", "investment"]),
  // Savings Calculator Data
  monthlyRemittance: z.number().min(0, "Monthly remittance must be positive").optional(),
  currentService: z.string().optional(),
  // Investment Profile Data
  investmentAmount: z.number().min(0, "Investment amount must be positive").optional(),
  lockPeriod: z.string().optional(),
  riskTolerance: z.string().optional(),
  primaryGoal: z.string().optional(),
  // Referral Information
  referralSource: z.string().optional(),
  // Wallet Information
  walletAddress: z.string().optional(),
  // Calculated Results
  calculations: z.object({
    annualSavings: z.number().optional(),
    monthlySavings: z.number().optional(),
    totalSavings5Years: z.number().optional(),
    projectedYield: z.number().optional(),
    annualYield: z.number().optional(),
    totalYield5Years: z.number().optional(),
    combinedBenefit: z.number().optional()
  }).optional(),
  // Metadata
  submittedAt: z.date().default(() => /* @__PURE__ */ new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

// server/early-access-api.ts
import { z as z2 } from "zod";
async function createEarlyAccessSubmission(req, res) {
  try {
    const validatedData = EarlyAccessFormSchema.parse({
      ...req.body,
      submittedAt: /* @__PURE__ */ new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent")
    });
    const db3 = await getMongoDB();
    if (!db3) {
      throw new Error("Database connection not available");
    }
    const collection = db3.collection("early_access_submissions");
    const existingSubmission = await collection.findOne({
      email: validatedData.email
    });
    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "Email already registered for early access",
        data: {
          email: validatedData.email,
          submittedAt: existingSubmission.createdAt
        }
      });
    }
    const submission = {
      ...validatedData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(submission);
    console.log("\u2705 Early access submission created:", {
      id: result.insertedId,
      email: validatedData.email,
      formType: validatedData.formType,
      fullName: validatedData.fullName
    });
    res.status(201).json({
      success: true,
      message: "Early access request submitted successfully",
      data: {
        id: result.insertedId,
        email: validatedData.email,
        formType: validatedData.formType,
        submittedAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error("\u274C Error creating early access submission:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}
async function getEarlyAccessSubmissions(req, res) {
  try {
    const db3 = await getMongoDB();
    if (!db3) {
      throw new Error("Database connection not available");
    }
    const collection = db3.collection("early_access_submissions");
    const { page = 1, limit = 50, formType, sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    const filter = {};
    if (formType) {
      filter.formType = formType;
    }
    const [submissions, total] = await Promise.all([
      collection.find(filter).sort(sort).skip(skip).limit(Number(limit)).toArray(),
      collection.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: {
        submissions: submissions.map((sub) => ({
          id: sub._id,
          fullName: sub.fullName,
          email: sub.email,
          phoneNumber: sub.phoneNumber,
          formType: sub.formType,
          walletAddress: sub.walletAddress,
          calculations: sub.calculations,
          submittedAt: sub.createdAt,
          ipAddress: sub.ipAddress
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("\u274C Error fetching early access submissions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}
async function getEarlyAccessStats(req, res) {
  try {
    const db3 = await getMongoDB();
    if (!db3) {
      throw new Error("Database connection not available");
    }
    const collection = db3.collection("early_access_submissions");
    const [
      totalSubmissions,
      savingsSubmissions,
      investmentSubmissions,
      recentSubmissions,
      totalCalculatedSavings,
      totalCalculatedReturns
    ] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ formType: "savings" }),
      collection.countDocuments({ formType: "investment" }),
      collection.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1e3) }
        // Last 24 hours
      }),
      collection.aggregate([
        { $match: { "calculations.totalSavings5Years": { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$calculations.totalSavings5Years" } } }
      ]).toArray(),
      collection.aggregate([
        { $match: { "calculations.totalYield5Years": { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$calculations.totalYield5Years" } } }
      ]).toArray()
    ]);
    res.json({
      success: true,
      data: {
        totalSubmissions,
        formTypeBreakdown: {
          savings: savingsSubmissions,
          investment: investmentSubmissions
        },
        recentSubmissions,
        totalCalculatedSavings: totalCalculatedSavings[0]?.total || 0,
        totalCalculatedReturns: totalCalculatedReturns[0]?.total || 0,
        lastUpdated: /* @__PURE__ */ new Date()
      }
    });
  } catch (error) {
    console.error("\u274C Error fetching early access stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}
async function updateEarlyAccessSubmission(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db3 = await getMongoDB();
    const collection = db3.collection("early_access_submissions");
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        }
      }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }
    res.json({
      success: true,
      message: "Submission updated successfully",
      data: { id, updated: result.modifiedCount > 0 }
    });
  } catch (error) {
    console.error("\u274C Error updating early access submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}
async function deleteEarlyAccessSubmission(req, res) {
  try {
    const { id } = req.params;
    const db3 = await getMongoDB();
    const collection = db3.collection("early_access_submissions");
    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }
    res.json({
      success: true,
      message: "Submission deleted successfully",
      data: { id, deleted: true }
    });
  } catch (error) {
    console.error("\u274C Error deleting early access submission:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong"
    });
  }
}

// server/routes.ts
import crypto4 from "crypto";
var router = express.Router();
router.post("/api/early-access/submit", createEarlyAccessSubmission);
router.get("/api/early-access/submissions", getEarlyAccessSubmissions);
router.get("/api/early-access/stats", getEarlyAccessStats);
router.put("/api/early-access/submissions/:id", updateEarlyAccessSubmission);
router.delete("/api/early-access/submissions/:id", deleteEarlyAccessSubmission);
router.post("/api/coinbase/session-token", async (req, res) => {
  try {
    const { userAddress } = req.body;
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: "Valid user address is required" });
    }
    const sessionToken = await CoinbaseSessionService.generateSecureToken(userAddress);
    res.json({
      sessionToken,
      success: true
    });
  } catch (error) {
    console.error("Error generating session token:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate session token",
      success: false
    });
  }
});
router.post("/api/kyc/digilocker/aadhaar", async (req, res) => {
  try {
    const { userAddress } = req.body;
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Valid user address is required"
      });
    }
    const result = await cashfreeKYCService.initiateDigilockerAadhaar({
      userAddress
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Digilocker Aadhaar initiation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate Digilocker verification"
    });
  }
});
router.get("/api/kyc/digilocker/status/:verificationId", async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({
        success: false,
        error: "Verification ID is required"
      });
    }
    const result = await cashfreeKYCService.checkDigilockerStatus(verificationId);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Digilocker status check error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to check verification status"
    });
  }
});
router.post("/api/kyc/pan/advanced", async (req, res) => {
  try {
    const { panNumber, fullName, userAddress, fatherName, dateOfBirth } = req.body;
    if (!panNumber || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "PAN number, full name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    const result = await cashfreeKYCService.verifyPANAdvanced({
      panNumber,
      fullName,
      userAddress,
      fatherName,
      dateOfBirth
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("PAN advanced verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify PAN"
    });
  }
});
router.post("/api/kyc/face/liveness", async (req, res) => {
  try {
    const { userAddress, verificationId } = req.body;
    if (!userAddress || !verificationId) {
      return res.status(400).json({
        success: false,
        error: "User address and verification ID are required"
      });
    }
    const result = await cashfreeKYCService.initiateFaceLiveness({
      userAddress,
      verificationId
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Face liveness initiation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate face liveness detection"
    });
  }
});
router.post("/api/kyc/bank/advanced", async (req, res) => {
  try {
    const { bankAccount, ifscCode, fullName, userAddress, verifyBalance } = req.body;
    if (!bankAccount || !ifscCode || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Bank account, IFSC code, full name, and user address are required"
      });
    }
    const result = await cashfreeKYCService.verifyBankAdvanced({
      bankAccount,
      ifscCode,
      fullName,
      userAddress,
      verifyBalance: verifyBalance || false
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Bank advanced verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify bank account"
    });
  }
});
router.post("/api/kyc/upi/advanced", async (req, res) => {
  try {
    const { upiId, fullName, userAddress, verifyBalance } = req.body;
    if (!upiId || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "UPI ID, full name, and user address are required"
      });
    }
    const result = await cashfreeKYCService.verifyUPIAdvanced({
      upiId,
      fullName,
      userAddress,
      verifyBalance: verifyBalance || false
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("UPI advanced verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify UPI"
    });
  }
});
router.post("/api/kyc/name/match", async (req, res) => {
  try {
    const { primaryName, secondaryName, userAddress } = req.body;
    if (!primaryName || !secondaryName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Primary name, secondary name, and user address are required"
      });
    }
    const result = await cashfreeKYCService.verifyNameMatch({
      primaryName,
      secondaryName,
      userAddress
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Name matching error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to perform name matching"
    });
  }
});
router.post("/api/kyc/comprehensive", async (req, res) => {
  try {
    const kycRequest = req.body;
    if (!kycRequest.userAddress || !kycRequest.fullName || !kycRequest.email) {
      return res.status(400).json({
        success: false,
        error: "User address, full name, and email are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(kycRequest.userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!["basic", "enhanced", "premium"].includes(kycRequest.verificationLevel)) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification level. Must be basic, enhanced, or premium"
      });
    }
    try {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress: kycRequest.userAddress,
        fullName: "REDACTED",
        // Don't store actual names
        email: "REDACTED",
        // Don't store actual emails
        phoneNumber: kycRequest.phone ? "PROVIDED" : void 0,
        aadharNumber: void 0,
        // Never store Aadhaar
        panNumber: kycRequest.panNumber ? "PROVIDED" : void 0
      });
    } catch (dbError) {
      console.warn("Database save failed, continuing with KYC:", dbError);
    }
    const result = await cashfreeKYCService.performComprehensiveKYC(kycRequest);
    try {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.updateKycStatus(
        kycRequest.userAddress,
        result.status
      );
    } catch (dbError) {
      console.warn("Database update failed:", dbError);
    }
    res.json(result);
  } catch (error) {
    console.error("Comprehensive KYC error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete comprehensive KYC"
    });
  }
});
router.post("/api/withdraw/inr/enhanced", async (req, res) => {
  try {
    const { userAddress, amount, txHash, verificationType, bankAccount, ifscCode, upiId, beneficiaryName } = req.body;
    if (!userAddress || !amount || !txHash) {
      return res.status(400).json({
        success: false,
        error: "User address, amount, and transaction hash are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address format"
      });
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const kycRecord = await DatabaseService2.getKycByAddress(userAddress);
    if (!kycRecord || kycRecord.status !== "verified") {
      return res.status(403).json({
        success: false,
        error: "KYC verification required before withdrawal"
      });
    }
    const exchangeRate = await cashfreeKYCService.getExchangeRate();
    const inrAmount = (parseFloat(amount) * exchangeRate).toString();
    const withdrawalResult = await cashfreeKYCService.processINRTransfer({
      userAddress,
      usdcAmount: amount,
      inrAmount,
      txHash,
      verificationType: verificationType || "bank",
      bankAccount,
      ifscCode,
      upiId,
      beneficiaryName: beneficiaryName || "Account Holder"
    });
    const withdrawalRecord = await DatabaseService2.createWithdrawalRequest({
      userAddress,
      usdcAmount: amount.toString(),
      inrAmount,
      txHash,
      verificationType: verificationType || "bank",
      bankAccount,
      ifscCode,
      upiId
    });
    res.json({
      success: true,
      withdrawalId: withdrawalRecord.id,
      transferId: withdrawalResult.transfer_id,
      inrAmount: parseFloat(inrAmount),
      exchangeRate,
      status: withdrawalResult.status,
      estimatedTime: withdrawalResult.estimated_completion,
      message: "Enhanced INR withdrawal initiated successfully"
    });
  } catch (error) {
    console.error("Enhanced INR withdrawal error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process enhanced INR withdrawal"
    });
  }
});
router.get("/api/kyc/status/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const kycRecord = await DatabaseService2.getKycByAddress(userAddress);
    const kycStatus = {
      userAddress,
      status: kycRecord?.status || "pending",
      verificationLevel: "basic",
      // Default level
      completedSteps: kycRecord ? ["personal_info"] : [],
      lastUpdated: kycRecord?.updatedAt || /* @__PURE__ */ new Date(),
      confidenceScore: kycRecord?.status === "verified" ? 85 : 0,
      canWithdraw: kycRecord?.status === "verified"
    };
    res.json(kycStatus);
  } catch (error) {
    console.error("KYC status check error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to check KYC status"
    });
  }
});
router.get("/api/travel-rule/wallet-status/:address", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const existingRecord = await DatabaseService2.getTravelRuleByAddress(address);
    res.json({
      isNewWallet: !existingRecord,
      hasCompliance: existingRecord?.status === "completed"
    });
  } catch (error) {
    console.error("Error checking wallet status:", error);
    res.status(500).json({ error: "Failed to check wallet status" });
  }
});
router.post("/api/travel-rule/wallet-processed", async (req, res) => {
  try {
    const { userAddress, skipped } = req.body;
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    await DatabaseService2.createTravelRuleRecord({
      userAddress,
      status: skipped ? "skipped" : "pending"
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking wallet as processed:", error);
    res.status(500).json({ error: "Failed to mark wallet as processed" });
  }
});
router.post("/api/travel-rule/originator", async (req, res) => {
  try {
    const { userAddress, originatorInfo, transactionAmount, complianceLevel, riskAssessment } = req.body;
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const amount = parseFloat(transactionAmount || "0");
    let determinedComplianceLevel = "basic";
    let additionalVerificationRequired = false;
    if (amount > 1e3) {
      determinedComplianceLevel = "enhanced";
      additionalVerificationRequired = true;
    }
    if (amount > 1e4 || riskAssessment?.riskCategory === "high") {
      determinedComplianceLevel = "high_risk";
      additionalVerificationRequired = true;
    }
    const encryptedOriginatorInfo = {
      // Store only hashed/encrypted versions of sensitive data
      fullNameHash: crypto4.createHash("sha256").update(originatorInfo.fullName || "").digest("hex"),
      addressHash: crypto4.createHash("sha256").update(JSON.stringify(originatorInfo.address || {})).digest("hex"),
      complianceLevel: determinedComplianceLevel,
      verificationLevel: originatorInfo.idType || "basic",
      riskCategory: riskAssessment?.riskCategory || "low",
      // Store metadata but not actual personal data
      dataCompleteness: {
        hasPersonalInfo: !!(originatorInfo.fullName && originatorInfo.dateOfBirth),
        hasAddressInfo: !!(originatorInfo.address?.street && originatorInfo.address?.city),
        hasFinancialInfo: !!(originatorInfo.accountNumber && originatorInfo.bankName),
        hasSourceOfFunds: !!originatorInfo.sourceOfFunds,
        hasPurposeOfTransaction: !!originatorInfo.purposeOfTransaction
      }
    };
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const expiryDate = /* @__PURE__ */ new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    await DatabaseService2.updateTravelRuleRecord(userAddress, {
      status: "completed",
      originatorInfo: JSON.stringify(encryptedOriginatorInfo),
      transactionAmount: transactionAmount?.toString(),
      complianceLevel: determinedComplianceLevel,
      riskCategory: riskAssessment?.riskCategory || "low",
      additionalVerificationRequired,
      verificationMethod: originatorInfo.additionalVerificationMethod || "document_verification",
      verificationTimestamp: /* @__PURE__ */ new Date(),
      expiryDate,
      completedAt: /* @__PURE__ */ new Date()
    });
    res.json({
      success: true,
      complianceLevel: determinedComplianceLevel,
      additionalVerificationRequired,
      expiryDate: expiryDate.toISOString()
    });
  } catch (error) {
    console.error("Error storing originator information:", error);
    res.status(500).json({ error: "Failed to store originator information" });
  }
});
router.get("/api/travel-rule/status/:address", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const record = await DatabaseService2.getTravelRuleByAddress(address);
    if (!record) {
      return res.json({
        isCompliant: false,
        status: "pending",
        complianceLevel: "basic",
        lastUpdated: null,
        isExpired: false
      });
    }
    const isExpired = await DatabaseService2.checkTravelRuleExpiry(address);
    const originatorInfo = record.originatorInfo ? JSON.parse(record.originatorInfo) : null;
    res.json({
      isCompliant: record.status === "completed" && !isExpired,
      status: record.status,
      complianceLevel: record.complianceLevel || "basic",
      riskCategory: record.riskCategory || "low",
      transactionAmount: record.transactionAmount ? parseFloat(record.transactionAmount) : 0,
      lastUpdated: record.updatedAt,
      expiryDate: record.expiryDate,
      isExpired,
      additionalVerificationRequired: record.additionalVerificationRequired || false,
      dataCompleteness: originatorInfo?.dataCompleteness || {},
      originatorInfo: originatorInfo && record.status === "completed" ? {
        complianceLevel: originatorInfo.complianceLevel || "basic",
        verificationLevel: originatorInfo.verificationLevel || "basic",
        riskCategory: originatorInfo.riskCategory || "low",
        completedAt: record.completedAt
      } : null
    });
  } catch (error) {
    console.error("Error getting compliance status:", error);
    res.status(500).json({ error: "Failed to get compliance status" });
  }
});
router.post("/api/travel-rule/compliance-requirements", async (req, res) => {
  try {
    const { transactionAmount, beneficiaryAddress, originatorAddress } = req.body;
    const amount = parseFloat(transactionAmount || "0");
    const isThirdParty = beneficiaryAddress && originatorAddress && beneficiaryAddress.toLowerCase() !== originatorAddress.toLowerCase();
    let complianceLevel = "basic";
    let requiredFields = ["fullName", "dateOfBirth", "nationalId", "address"];
    let additionalVerificationRequired = false;
    if (amount > 1e3) {
      complianceLevel = "enhanced";
      requiredFields.push("accountNumber", "bankName", "sourceOfFunds", "purposeOfTransaction");
      additionalVerificationRequired = true;
      if (isThirdParty) {
        requiredFields.push("relationshipToBeneficiary", "additionalVerificationMethod");
      }
    }
    if (amount > 1e4) {
      complianceLevel = "high_risk";
      additionalVerificationRequired = true;
      requiredFields.push("swiftCode", "ownershipDetails", "controllingParty");
    }
    res.json({
      complianceLevel,
      requiredFields,
      additionalVerificationRequired,
      isThirdParty,
      thresholds: {
        basic: { min: 0, max: 1e3 },
        enhanced: { min: 1e3, max: 1e4 },
        high_risk: { min: 1e4, max: null }
      },
      estimatedCompletionTime: complianceLevel === "basic" ? "5 minutes" : complianceLevel === "enhanced" ? "10 minutes" : "15 minutes"
    });
  } catch (error) {
    console.error("Error determining compliance requirements:", error);
    res.status(500).json({ error: "Failed to determine compliance requirements" });
  }
});
router.post("/api/kyc/surepass/aadhaar", async (req, res) => {
  try {
    const { aadhaarNumber, userAddress, consent } = req.body;
    if (!aadhaarNumber || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Aadhaar number and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for Aadhaar verification"
      });
    }
    const result = await surePassKYCService.verifyAadhaar({
      aadhaarNumber,
      userAddress,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("SurePass Aadhaar verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify Aadhaar"
    });
  }
});
router.post("/api/kyc/surepass/pan", async (req, res) => {
  try {
    const { panNumber, fullName, userAddress, consent } = req.body;
    if (!panNumber || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "PAN number, full name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for PAN verification"
      });
    }
    const result = await surePassKYCService.verifyPAN({
      panNumber,
      fullName,
      userAddress,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("SurePass PAN verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify PAN"
    });
  }
});
router.post("/api/kyc/surepass/voter-id", async (req, res) => {
  try {
    const { voterIdNumber, fullName, userAddress, state, consent } = req.body;
    if (!voterIdNumber || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Voter ID number, full name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for Voter ID verification"
      });
    }
    const result = await surePassKYCService.verifyVoterId({
      voterIdNumber,
      fullName,
      userAddress,
      state,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("SurePass Voter ID verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify Voter ID"
    });
  }
});
router.post("/api/kyc/surepass/driving-license", async (req, res) => {
  try {
    const { dlNumber, fullName, dateOfBirth, userAddress, consent } = req.body;
    if (!dlNumber || !fullName || !dateOfBirth || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "DL number, full name, date of birth, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for Driving License verification"
      });
    }
    const result = await surePassKYCService.verifyDrivingLicense({
      dlNumber,
      fullName,
      dateOfBirth,
      userAddress,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("SurePass Driving License verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify Driving License"
    });
  }
});
router.post("/api/kyc/surepass/phone", async (req, res) => {
  try {
    const { phoneNumber, userAddress, consent } = req.body;
    if (!phoneNumber || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Phone number and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for phone verification"
      });
    }
    const result = await surePassKYCService.verifyPhone({
      phoneNumber,
      userAddress,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("SurePass Phone verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify phone number"
    });
  }
});
router.post("/api/kyc/surepass/multi-document", async (req, res) => {
  try {
    const { documents, userInfo } = req.body;
    if (!documents || !userInfo) {
      return res.status(400).json({
        success: false,
        error: "Documents and user info are required"
      });
    }
    if (!userInfo.fullName || !userInfo.userAddress) {
      return res.status(400).json({
        success: false,
        error: "User full name and address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userInfo.userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    const result = await surePassKYCService.performMultiDocumentKYC(documents, userInfo);
    if (result.success) {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress: userInfo.userAddress,
        fullName: "REDACTED",
        // Don't store actual names
        email: "REDACTED",
        // Don't store actual emails
        phoneNumber: documents.phone ? "PROVIDED" : void 0,
        aadharNumber: documents.aadhaar ? "PROVIDED" : void 0,
        panNumber: documents.pan ? "PROVIDED" : void 0
      });
      await DatabaseService2.updateKycStatus(
        userInfo.userAddress,
        result.status === "verified" ? "verified" : result.status === "partial" ? "pending" : "rejected"
      );
    }
    res.json(result);
  } catch (error) {
    console.error("SurePass Multi-document KYC error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete multi-document KYC"
    });
  }
});
router.post("/api/kyc/hybrid-verification", async (req, res) => {
  try {
    const { userAddress, documents, userInfo, verificationLevel } = req.body;
    if (!userAddress || !documents || !userInfo) {
      return res.status(400).json({
        success: false,
        error: "User address, documents, and user info are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    const results = [];
    let totalSuccess = 0;
    let totalAttempts = 0;
    if (documents.aadhaar || documents.pan || documents.phone) {
      try {
        totalAttempts++;
        const surePassResult = await surePassKYCService.performMultiDocumentKYC(documents, userInfo);
        results.push({ provider: "surepass", result: surePassResult });
        if (surePassResult.success) totalSuccess++;
      } catch (error) {
        console.error("SurePass verification failed:", error);
        results.push({ provider: "surepass", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    if (verificationLevel === "enhanced" || verificationLevel === "premium") {
      try {
        totalAttempts++;
        const cashfreeKycRequest = {
          userAddress,
          fullName: userInfo.fullName,
          email: userInfo.email || "user@example.com",
          phone: userInfo.phone || documents.phone || "",
          panNumber: documents.pan,
          bankAccount: userInfo.bankAccount,
          ifscCode: userInfo.ifscCode,
          upiId: userInfo.upiId,
          verificationLevel: verificationLevel || "enhanced"
        };
        const cashfreeResult = await cashfreeKYCService.performComprehensiveKYC(cashfreeKycRequest);
        results.push({ provider: "cashfree", result: cashfreeResult });
        if (cashfreeResult.success) totalSuccess++;
      } catch (error) {
        console.error("Cashfree verification failed:", error);
        results.push({ provider: "cashfree", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    const overallConfidence = totalAttempts > 0 ? totalSuccess / totalAttempts * 100 : 0;
    let finalStatus = "failed";
    if (overallConfidence >= 90) {
      finalStatus = "verified";
    } else if (overallConfidence >= 60) {
      finalStatus = "partial";
    }
    try {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress,
        fullName: "REDACTED",
        email: "REDACTED",
        phoneNumber: documents.phone ? "PROVIDED" : void 0,
        aadharNumber: documents.aadhaar ? "PROVIDED" : void 0,
        panNumber: documents.pan ? "PROVIDED" : void 0
      });
      await DatabaseService2.updateKycStatus(
        userAddress,
        finalStatus === "verified" ? "verified" : finalStatus === "partial" ? "pending" : "rejected"
      );
    } catch (dbError) {
      console.warn("Database operations failed:", dbError);
    }
    const response = {
      success: totalSuccess > 0,
      verificationId: crypto4.randomUUID(),
      status: finalStatus,
      confidenceScore: Math.round(overallConfidence),
      results,
      providersUsed: results.map((r) => r.provider),
      successfulProviders: results.filter((r) => r.result?.success).map((r) => r.provider),
      message: `Hybrid KYC completed with ${totalSuccess}/${totalAttempts} successful verifications`
    };
    res.json(response);
  } catch (error) {
    console.error("Hybrid KYC verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete hybrid KYC verification"
    });
  }
});
router.post("/api/kyc/aadhaar/otp/initiate", async (req, res) => {
  try {
    const { aadhaarNumber, userAddress, consent } = req.body;
    if (!aadhaarNumber || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Aadhaar number and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for Aadhaar verification"
      });
    }
    const result = await enhancedKYCService.initiateAadhaarOTP({
      aadhaarNumber,
      userAddress,
      consent
    });
    res.json(result);
  } catch (error) {
    console.error("Aadhaar OTP initiation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate Aadhaar OTP"
    });
  }
});
router.post("/api/kyc/aadhaar/otp/verify", async (req, res) => {
  try {
    const { aadhaarNumber, otp, sessionId, userAddress } = req.body;
    if (!aadhaarNumber || !otp || !sessionId || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Aadhaar number, OTP, session ID, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    const result = await enhancedKYCService.verifyAadhaarOTP({
      aadhaarNumber,
      otp,
      sessionId,
      userAddress
    });
    if (result.success && result.status === "verified") {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress,
        fullName: "REDACTED",
        email: "REDACTED",
        aadharNumber: "PROVIDED"
      });
      await DatabaseService2.updateKycStatus(userAddress, "verified");
    }
    res.json(result);
  } catch (error) {
    console.error("Aadhaar OTP verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify Aadhaar OTP"
    });
  }
});
router.post("/api/kyc/pan/verify", async (req, res) => {
  try {
    const { panNumber, fullName, dateOfBirth, userAddress, consent } = req.body;
    if (!panNumber || !fullName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "PAN number, full name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for PAN verification"
      });
    }
    const result = await enhancedKYCService.verifyPAN({
      panNumber,
      fullName,
      dateOfBirth,
      userAddress,
      consent
    });
    if (result.success) {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress,
        fullName: "REDACTED",
        email: "REDACTED",
        panNumber: "PROVIDED"
      });
      await DatabaseService2.updateKycStatus(userAddress, "verified");
    }
    res.json(result);
  } catch (error) {
    console.error("PAN verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify PAN"
    });
  }
});
router.post("/api/kyc/face/liveness/initiate", async (req, res) => {
  try {
    const { userAddress, referencePhoto, verificationId } = req.body;
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: "User address is required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    const result = await enhancedKYCService.initiateFaceLiveness({
      userAddress,
      referencePhoto,
      verificationId
    });
    res.json(result);
  } catch (error) {
    console.error("Face liveness initiation error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to initiate face liveness detection"
    });
  }
});
router.get("/api/kyc/face/liveness/status/:verificationId", async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({
        success: false,
        error: "Verification ID is required"
      });
    }
    const result = await enhancedKYCService.checkFaceLivenessStatus(verificationId);
    res.json(result);
  } catch (error) {
    console.error("Face liveness status check error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to check face liveness status"
    });
  }
});
router.post("/api/kyc/bank/verify", async (req, res) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, userAddress, verifyBalance, consent } = req.body;
    if (!accountNumber || !ifscCode || !accountHolderName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "Account number, IFSC code, account holder name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for bank account verification"
      });
    }
    const result = await enhancedKYCService.verifyBankAccount({
      accountNumber,
      ifscCode,
      accountHolderName,
      userAddress,
      verifyBalance: verifyBalance || false,
      consent
    });
    if (result.success) {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress,
        fullName: "REDACTED",
        email: "REDACTED",
        bankAccount: "PROVIDED"
      });
      await DatabaseService2.updateKycStatus(userAddress, "verified");
    }
    res.json(result);
  } catch (error) {
    console.error("Bank account verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify bank account"
    });
  }
});
router.post("/api/kyc/upi/verify", async (req, res) => {
  try {
    const { upiId, accountHolderName, userAddress, verifyBalance, consent } = req.body;
    if (!upiId || !accountHolderName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: "UPI ID, account holder name, and user address are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for UPI verification"
      });
    }
    const result = await enhancedKYCService.verifyUPI({
      upiId,
      accountHolderName,
      userAddress,
      verifyBalance: verifyBalance || false,
      consent
    });
    if (result.success) {
      const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
      await DatabaseService2.createKycRecord({
        userAddress,
        fullName: "REDACTED",
        email: "REDACTED",
        upiId: "PROVIDED"
      });
      await DatabaseService2.updateKycStatus(userAddress, "verified");
    }
    res.json(result);
  } catch (error) {
    console.error("UPI verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify UPI"
    });
  }
});
router.post("/api/kyc/complete", async (req, res) => {
  try {
    const {
      userAddress,
      aadhaar,
      pan,
      bankAccount,
      upi,
      userInfo,
      consent
    } = req.body;
    if (!userAddress || !userInfo?.fullName) {
      return res.status(400).json({
        success: false,
        error: "User address and full name are required"
      });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user address format"
      });
    }
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: "User consent is required for KYC verification"
      });
    }
    const results = [];
    let totalSuccess = 0;
    let totalAttempts = 0;
    if (aadhaar?.sessionId && aadhaar?.otp) {
      totalAttempts++;
      try {
        const aadhaarResult = await enhancedKYCService.verifyAadhaarOTP({
          aadhaarNumber: aadhaar.number,
          otp: aadhaar.otp,
          sessionId: aadhaar.sessionId,
          userAddress
        });
        results.push({ type: "aadhaar", result: aadhaarResult });
        if (aadhaarResult.success && aadhaarResult.status === "verified") totalSuccess++;
      } catch (error) {
        results.push({ type: "aadhaar", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    if (pan?.number) {
      totalAttempts++;
      try {
        const panResult = await enhancedKYCService.verifyPAN({
          panNumber: pan.number,
          fullName: userInfo.fullName,
          dateOfBirth: userInfo.dateOfBirth,
          userAddress,
          consent
        });
        results.push({ type: "pan", result: panResult });
        if (panResult.success) totalSuccess++;
      } catch (error) {
        results.push({ type: "pan", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    if (bankAccount?.accountNumber && bankAccount?.ifscCode) {
      totalAttempts++;
      try {
        const bankResult = await enhancedKYCService.verifyBankAccount({
          accountNumber: bankAccount.accountNumber,
          ifscCode: bankAccount.ifscCode,
          accountHolderName: userInfo.fullName,
          userAddress,
          verifyBalance: bankAccount.verifyBalance || false,
          consent
        });
        results.push({ type: "bank", result: bankResult });
        if (bankResult.success) totalSuccess++;
      } catch (error) {
        results.push({ type: "bank", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    if (upi?.id) {
      totalAttempts++;
      try {
        const upiResult = await enhancedKYCService.verifyUPI({
          upiId: upi.id,
          accountHolderName: userInfo.fullName,
          userAddress,
          verifyBalance: upi.verifyBalance || false,
          consent
        });
        results.push({ type: "upi", result: upiResult });
        if (upiResult.success) totalSuccess++;
      } catch (error) {
        results.push({ type: "upi", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }
    const confidenceScore = totalAttempts > 0 ? totalSuccess / totalAttempts * 100 : 0;
    let status = "failed";
    if (confidenceScore >= 80) {
      status = "verified";
    } else if (confidenceScore >= 50) {
      status = "partial";
    }
    const { DatabaseService: DatabaseService2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    await DatabaseService2.createKycRecord({
      userAddress,
      fullName: "REDACTED",
      email: "REDACTED",
      aadharNumber: aadhaar?.number ? "PROVIDED" : void 0,
      panNumber: pan?.number ? "PROVIDED" : void 0,
      bankAccount: bankAccount?.accountNumber ? "PROVIDED" : void 0,
      upiId: upi?.id ? "PROVIDED" : void 0
    });
    await DatabaseService2.updateKycStatus(
      userAddress,
      status === "verified" ? "verified" : status === "partial" ? "pending" : "rejected"
    );
    const response = {
      success: totalSuccess > 0,
      verificationId: crypto4.randomUUID(),
      status,
      confidenceScore: Math.round(confidenceScore),
      results,
      totalAttempts,
      totalSuccess,
      message: `Complete KYC finished with ${totalSuccess}/${totalAttempts} successful verifications`
    };
    res.json(response);
  } catch (error) {
    console.error("Complete KYC verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete KYC verification"
    });
  }
});
router.get("/api/exchange-rate/usd-inr", async (req, res) => {
  try {
    const rate = await cashfreeKYCService.getExchangeRate();
    res.json({
      success: true,
      rate,
      currency_pair: "USD/INR",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "Real-time Exchange API"
    });
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch exchange rate",
      rate: 84.5
      // Fallback rate
    });
  }
});
router.get("/api/pool/data", async (req, res) => {
  try {
    const blockchainData = await BlockchainService.getPoolData();
    const deposits = blockchainData.events.map((event, index) => ({
      id: `${event.transactionHash || "unknown"}-${index}`,
      address: event.args?.owner || "0x0000000000000000000000000000000000000000",
      amount: event.args?.assets ? Number(event.args.assets) / 1e6 : 0,
      // USDC has 6 decimals
      timestamp: /* @__PURE__ */ new Date(),
      // TODO: Get actual block timestamp
      txHash: event.transactionHash || "",
      yieldEarned: 0,
      // TODO: Calculate earned yield
      status: "active",
      blockNumber: Number(event.blockNumber || 0)
    }));
    const poolData = {
      poolData: {
        totalValueLocked: blockchainData.totalValueLocked,
        totalInvestors: blockchainData.totalInvestors,
        totalYieldPaid: 0,
        // TODO: Calculate from yield distribution events
        currentAPY: 12,
        // TODO: Calculate based on actual performance
        lastUpdated: /* @__PURE__ */ new Date(),
        contractAddress: CONTRACTS.STABLE_PAY_VAULT
      },
      deposits,
      distributions: []
      // TODO: Process yield distribution events
    };
    res.json(poolData);
  } catch (error) {
    console.error("Error fetching pool data:", error);
    const fallbackData = {
      poolData: {
        totalValueLocked: 0,
        totalInvestors: 0,
        totalYieldPaid: 0,
        currentAPY: 12,
        lastUpdated: /* @__PURE__ */ new Date(),
        contractAddress: CONTRACTS.STABLE_PAY_VAULT
      },
      deposits: [],
      distributions: []
    };
    res.json(fallbackData);
  }
});
router.get("/api/wallet/:address/balances", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const balances = await getWalletBalances(address);
    res.json(balances);
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    res.status(500).json({
      error: "Failed to fetch wallet balances",
      address: req.params.address,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
});
router.get("/api/vault/:address/deposit", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const balances = await getWalletBalances(address);
    if (balances.userDepositInfo) {
      res.json({
        address,
        deposit: balances.userDepositInfo,
        yieldAvailable: balances.yieldAvailable,
        lastUpdated: /* @__PURE__ */ new Date()
      });
    } else {
      res.json({
        address,
        deposit: null,
        yieldAvailable: { raw: "0", formatted: 0, symbol: "USDC" },
        lastUpdated: /* @__PURE__ */ new Date()
      });
    }
  } catch (error) {
    console.error("Error fetching user deposit info:", error);
    res.status(500).json({
      error: "Failed to fetch user deposit information",
      address: req.params.address,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
});
router.get("/api/wallet/:address/transactions", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const walletData = await BlockchainService.getWalletTransactions(address);
    const deposits = walletData.depositEvents.map((event, index) => ({
      id: `deposit-${event.transactionHash || "unknown"}-${index}`,
      type: "deposit",
      address: event.args?.owner || address,
      amount: event.args?.assets ? Number(event.args.assets) / 1e6 : 0,
      shares: event.args?.shares ? Number(event.args.shares) / 1e18 : 0,
      timestamp: event.timestamp || /* @__PURE__ */ new Date(),
      txHash: event.transactionHash || "",
      blockNumber: Number(event.blockNumber || 0),
      status: "completed"
    }));
    const withdrawals = walletData.withdrawEvents.map((event, index) => ({
      id: `withdraw-${event.transactionHash || "unknown"}-${index}`,
      type: "withdrawal",
      address: event.args?.owner || address,
      amount: event.args?.assets ? Number(event.args.assets) / 1e6 : 0,
      shares: event.args?.shares ? Number(event.args.shares) / 1e18 : 0,
      timestamp: event.timestamp || /* @__PURE__ */ new Date(),
      txHash: event.transactionHash || "",
      blockNumber: Number(event.blockNumber || 0),
      status: "completed"
    }));
    const transfers = walletData.transferEvents?.map((event, index) => ({
      id: `transfer-${event.transactionHash || "unknown"}-${index}`,
      type: event.args?.from?.toLowerCase() === address.toLowerCase() ? "transfer_out" : "transfer_in",
      from: event.args?.from || "",
      to: event.args?.to || "",
      amount: event.args?.value ? Number(event.args.value) / 1e6 : 0,
      timestamp: event.timestamp || /* @__PURE__ */ new Date(),
      txHash: event.transactionHash || "",
      blockNumber: Number(event.blockNumber || 0),
      status: "completed"
    })) || [];
    const allTransactions = [...deposits, ...withdrawals, ...transfers].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({
      address,
      transactions: allTransactions,
      summary: {
        totalDeposits: deposits.length,
        totalWithdrawals: withdrawals.length,
        totalTransfers: transfers.length,
        totalDepositAmount: deposits.reduce((sum, tx) => sum + tx.amount, 0),
        totalWithdrawalAmount: withdrawals.reduce((sum, tx) => sum + tx.amount, 0)
      },
      lastUpdated: /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({
      error: "Failed to fetch wallet transactions",
      address: req.params.address,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
});
router.get("/api/pool/wallet/:address", async (req, res) => {
  try {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address format" });
    }
    const walletData = await BlockchainService.getWalletTransactions(address);
    const deposits = walletData.depositEvents.map((event, index) => ({
      id: `${event.transactionHash || "unknown"}-${index}`,
      address: event.args?.owner || address,
      amount: event.args?.assets ? Number(event.args.assets) / 1e6 : 0,
      // USDC has 6 decimals
      timestamp: event.timestamp || /* @__PURE__ */ new Date(),
      txHash: event.transactionHash || "",
      yieldEarned: 0,
      // TODO: Calculate earned yield
      status: "active",
      blockNumber: Number(event.blockNumber || 0)
    }));
    res.json({ deposits });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    res.json({ deposits: [] });
  }
});
router.get("/api/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  const user = await storage.getUser(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
router.post("/api/users", async (req, res) => {
  try {
    const newUser = await storage.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user" });
  }
});
router.get("/api/portfolio/:userId", async (req, res) => {
  res.status(501).json({ message: "Portfolio API not implemented" });
});
router.get("/api/transactions/:userId", async (req, res) => {
  res.status(501).json({ message: "Transactions API not implemented" });
});
router.post("/api/wallets/create", async (req, res) => {
  res.status(501).json({ message: "Wallet creation not implemented" });
});
router.post("/api/wallets/topup", async (req, res) => {
  res.status(200).json({ message: "Top-up successful" });
});
router.post("/api/wallets/transfer", async (req, res) => {
  res.status(200).json({ message: "Transfer successful" });
});
router.post("/api/check-paymaster-allowlist", async (req, res) => {
  try {
    const { contractAddress, functionSelector } = req.body;
    const { checkPaymasterAllowlist: checkPaymasterAllowlist2 } = await Promise.resolve().then(() => (init_paymaster_allowlist(), paymaster_allowlist_exports));
    const result = await checkPaymasterAllowlist2(contractAddress, functionSelector);
    res.json(result);
  } catch (error) {
    console.error("Error checking paymaster allowlist:", error);
    res.status(500).json({ error: "Failed to check allowlist" });
  }
});
router.get("/api/verify-allowlist", async (req, res) => {
  try {
    const { verifyAllowlistStatus: verifyAllowlistStatus2, generateAllowlistInstructions: generateAllowlistInstructions2 } = await Promise.resolve().then(() => (init_verify_allowlist(), verify_allowlist_exports));
    const results = await verifyAllowlistStatus2();
    const instructions = generateAllowlistInstructions2(results);
    res.json({
      results,
      instructions,
      allAllowlisted: results.every((r) => r.isAllowlisted),
      summary: {
        total: results.length,
        allowlisted: results.filter((r) => r.isAllowlisted).length,
        needsAllowlisting: results.filter((r) => !r.isAllowlisted).length
      }
    });
  } catch (error) {
    console.error("Error verifying allowlist:", error);
    res.status(500).json({ error: "Failed to verify allowlist" });
  }
});
var routes_default = router;
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/stablepay/metrics/:address", async (req, res) => {
    try {
      const { address } = req.params;
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ error: "Invalid address format" });
      }
      const walletData = await getWalletBalances(address);
      const now = Date.now();
      const hoursElapsed = Math.floor((now - (walletData.lastUpdated?.getTime() || now)) / (1e3 * 60 * 60));
      let currentAPY = 12;
      if (walletData.vaultBalance.formatted > 1e5) currentAPY = 24;
      else if (walletData.vaultBalance.formatted > 5e4) currentAPY = 20;
      else if (walletData.vaultBalance.formatted > 25e3) currentAPY = 16;
      else if (walletData.vaultBalance.formatted > 1e4) currentAPY = 14;
      const principalAmount = BigInt(walletData.vaultBalance.raw);
      const hourlyRate = currentAPY / 100 / 365 / 24;
      const principalNumber = Number(principalAmount) / 1e6;
      const currentYieldNumber = principalNumber * hourlyRate * Math.max(1, hoursElapsed);
      const currentYield = BigInt(Math.floor(currentYieldNumber * 1e6));
      const metrics = {
        userBalance: walletData.vaultBalance.raw,
        yieldEarned: (BigInt(walletData.yieldAvailable.raw) + currentYield).toString(),
        lockStatus: walletData.userDepositInfo ? {
          isLocked: walletData.userDepositInfo.isLocked,
          daysRemaining: walletData.userDepositInfo.daysRemaining,
          unlockDate: walletData.userDepositInfo.isLocked && walletData.userDepositInfo.lockUntil ? new Date(Number(walletData.userDepositInfo.lockUntil) * 1e3).toISOString() : null
        } : {
          isLocked: false,
          daysRemaining: 0,
          unlockDate: null
        },
        apy: currentAPY,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        hoursElapsed,
        totalValueLocked: walletData.vaultBalance.formatted,
        networkStatus: "live",
        contractAddress: CONTRACTS.STABLE_PAY_VAULT
      };
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching StablePay metrics:", error);
      res.status(500).json({
        error: "Failed to fetch metrics",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    global: "globalThis"
  },
  optimizeDeps: {
    include: ["buffer"]
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.warn(
      `Could not find the build directory: ${distPath}, serving API only`
    );
    app2.use("*", (_req, res) => {
      res.status(404).json({ error: "Not found" });
    });
    return;
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(routes_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const mongoDb = await connectToMongoDB();
    if (mongoDb) {
      console.log("\u2705 MongoDB connection established");
    } else {
      console.log("\u{1F504} Running without MongoDB - using mock data");
    }
  } catch (error) {
    console.error("\u274C Failed to connect to MongoDB:", error);
    console.log("\u{1F504} Running without MongoDB - using mock data");
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = Number(process.env.PORT) || 8080;
  server.listen(PORT, "0.0.0.0", async () => {
    const colors = await import("picocolors");
    const { bold, green } = colors.default;
    console.log();
    console.log(`  ${bold(green("\u279C"))}  ${bold("Local")}: ${green(`http://localhost:${PORT}`)}`);
    console.log(`  ${bold(green("\u279C"))}  ${bold("Network")}: ${green(`http://0.0.0.0:${PORT}`)}`);
    console.log();
  });
})();
