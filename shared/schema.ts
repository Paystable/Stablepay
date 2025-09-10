
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
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

export const kycRecords = pgTable("kyc_records", {
  id: serial("id").primaryKey(),
  userAddress: varchar("user_address", { length: 42 }).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  aadharNumber: text("aadhar_number"),
  panNumber: text("pan_number"),
  status: text("status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
  verificationData: text("verification_data"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const transactions = pgTable("transactions", {
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

export const withdrawalRequests = pgTable("withdrawal_requests", {
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

export const travelRuleCompliance = pgTable("travel_rule_compliance", {
  id: serial("id").primaryKey(),
  userAddress: varchar("user_address", { length: 42 }).notNull().unique(),
  status: text("status", { enum: ["pending", "completed", "skipped"] }).default("pending"),
  
  // Transaction Information
  transactionAmount: decimal("transaction_amount", { precision: 18, scale: 2 }),
  transactionCurrency: varchar("transaction_currency", { length: 3 }).default("USD"),
  complianceLevel: text("compliance_level", { enum: ["basic", "enhanced", "high_risk"] }).default("basic"),
  
  // Originator Information (encrypted JSON)
  originatorInfo: text("originator_info"), // JSON string with encrypted personal data
  
  // Risk Assessment
  riskCategory: text("risk_category", { enum: ["low", "medium", "high"] }).default("low"),
  additionalVerificationRequired: boolean("additional_verification_required").default(false),
  verificationMethod: text("verification_method"),
  
  // Compliance Metadata
  dataSource: text("data_source").default("self_declared"), // self_declared, third_party_verified, etc.
  verificationTimestamp: timestamp("verification_timestamp"),
  expiryDate: timestamp("expiry_date"), // When the compliance data expires
  
  // Audit Trail
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  email: true,
  fullName: true
});

export const insertKycSchema = createInsertSchema(kycRecords).pick({
  userAddress: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  aadharNumber: true,
  panNumber: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type KycRecord = typeof kycRecords.$inferSelect;
export type InsertKycRecord = z.infer<typeof insertKycSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type TravelRuleCompliance = typeof travelRuleCompliance.$inferSelect;
