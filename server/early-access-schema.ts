import { z } from 'zod';

// Early Access Form Data Schema
export const EarlyAccessFormSchema = z.object({
  // Contact Information
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  
  // Form Type
  formType: z.enum(['savings', 'investment']),
  
  // Savings Calculator Data
  monthlyRemittance: z.number().min(0, 'Monthly remittance must be positive').optional(),
  currentService: z.string().optional(),
  
  // Investment Profile Data
  investmentAmount: z.number().min(0, 'Investment amount must be positive').optional(),
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
    combinedBenefit: z.number().optional(),
  }).optional(),
  
  // Metadata
  submittedAt: z.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type EarlyAccessFormData = z.infer<typeof EarlyAccessFormSchema>;

// MongoDB Collection Interface
export interface EarlyAccessRecord extends EarlyAccessFormData {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}
