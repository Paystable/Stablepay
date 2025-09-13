
// Import environment configuration FIRST
import crypto from 'crypto';

export interface CashfreeConfig {
  apiKey: string;
  secretKey: string;
  merchantId: string;
  accountId: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export interface DigilockerAadhaarRequest {
  userAddress: string;
  consentId?: string;
}

export interface DigilockerAadhaarResponse {
  verificationId: string;
  consentUrl: string;
  status: 'initiated' | 'completed' | 'failed';
  aadhaarData?: {
    nameMatch: boolean;
    photoMatch: boolean;
    addressVerified: boolean;
  };
}

export interface PANAdvancedVerification {
  panNumber: string;
  fullName: string;
  userAddress: string;
  fatherName?: string;
  dateOfBirth?: string;
}

export interface FaceLivenessRequest {
  userAddress: string;
  verificationId: string;
}

export interface BankAdvancedVerification {
  bankAccount: string;
  ifscCode: string;
  fullName: string;
  userAddress: string;
  verifyBalance?: boolean;
}

export interface UPIAdvancedVerification {
  upiId: string;
  fullName: string;
  userAddress: string;
  verifyBalance?: boolean;
}

export interface NameMatchRequest {
  primaryName: string;
  secondaryName: string;
  userAddress: string;
}

export interface ComprehensiveKYCRequest {
  userAddress: string;
  fullName: string;
  email: string;
  phone: string;
  panNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
}

export interface INRWithdrawalRequest {
  userAddress: string;
  usdcAmount: string;
  inrAmount: string;
  txHash: string;
  verificationType: 'bank' | 'upi';
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  beneficiaryName: string;
}

export class CashfreeKYCService {
  private config: CashfreeConfig;

  constructor() {
    this.config = {
      apiKey: process.env.CASHFREE_API_KEY || '',
      secretKey: process.env.CASHFREE_SECRET_KEY || '',
      merchantId: process.env.CASHFREE_MERCHANT_ID || '',
      accountId: process.env.CASHFREE_ACCOUNT_ID || '',
      baseUrl: process.env.CASHFREE_ENVIRONMENT === 'production' 
        ? 'https://api.cashfree.com/verification'
        : 'https://sandbox.cashfree.com/verification',
      environment: (process.env.CASHFREE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };

    console.log(`Cashfree KYC Service initialized in ${this.config.environment} mode`);

    if (!this.isConfigured()) {
      console.warn('Cashfree API credentials not configured. Using mock responses.');
    }
  }

  private generateSignature(payload: any): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureData = `${timestamp}${JSON.stringify(payload)}`;
    return crypto.createHmac('sha256', this.config.secretKey).update(signatureData).digest('hex');
  }

  private getHeaders(payload?: any) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.config.apiKey,
      'x-client-secret': this.config.secretKey,
      'x-timestamp': timestamp,
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.config.secretKey}`
    };

    if (payload) {
      headers['x-signature'] = this.generateSignature(payload);
    }

    return headers;
  }

  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretKey && this.config.merchantId);
  }

  private validatePAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  private validateAadhaar(aadhaar: string): boolean {
    const clean = aadhaar.replace(/\s/g, '');
    return /^[0-9]{12}$/.test(clean);
  }

  private validateIFSC(ifsc: string): boolean {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  }

  private validateUPI(upi: string): boolean {
    return /^[\w.-]+@[\w.-]+$/.test(upi);
  }

  // Digilocker Aadhaar Verification with Document Fetch
  async initiateDigilockerAadhaar(request: DigilockerAadhaarRequest): Promise<DigilockerAadhaarResponse> {
    try {
      if (!this.isConfigured()) {
        // Mock response for development
        return {
          verificationId: `digilocker_${Date.now()}`,
          consentUrl: 'https://digilocker.gov.in/consent/mock',
          status: 'initiated'
        };
      }

      const payload = {
        purpose: 'Identity verification for financial services',
        consent_required: true,
        fetch_document: true,
        verify_signature: true,
        extract_data: true
      };

      const response = await fetch(`${this.config.baseUrl}/v3/digilocker/aadhaar`, {
        method: 'POST',
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
        status: result.status === 'success' ? 'initiated' : 'failed'
      };
    } catch (error) {
      console.error('Digilocker Aadhaar initiation failed:', error);
      throw new Error('Failed to initiate Digilocker Aadhaar verification');
    }
  }

  // Check Digilocker Aadhaar Status with Name/Photo Match
  async checkDigilockerStatus(verificationId: string): Promise<DigilockerAadhaarResponse> {
    try {
      if (!this.isConfigured()) {
        // Mock response
        return {
          verificationId,
          consentUrl: '',
          status: 'completed',
          aadhaarData: {
            nameMatch: true,
            photoMatch: true,
            addressVerified: true
          }
        };
      }

      const response = await fetch(`${this.config.baseUrl}/v3/digilocker/status/${verificationId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check verification status');
      }

      return {
        verificationId,
        consentUrl: '',
        status: result.status === 'completed' ? 'completed' : 'failed',
        aadhaarData: result.verification_data ? {
          nameMatch: result.verification_data.name_match === 'Y',
          photoMatch: result.verification_data.photo_match === 'Y',
          addressVerified: result.verification_data.address_verified === 'Y'
        } : undefined
      };
    } catch (error) {
      console.error('Digilocker status check failed:', error);
      throw new Error('Failed to check Digilocker verification status');
    }
  }

  // Enhanced PAN Verification with Advanced Details
  async verifyPANAdvanced(request: PANAdvancedVerification): Promise<any> {
    try {
      if (!this.validatePAN(request.panNumber)) {
        throw new Error('Invalid PAN format');
      }

      if (!this.isConfigured()) {
        return {
          valid: true,
          pan_status: 'VALID',
          name_match: 'Y',
          category: 'Individual',
          last_updated: new Date().toISOString()
        };
      }

      const payload = {
        pan: request.panNumber.toUpperCase(),
        name: request.fullName,
        father_name: request.fatherName,
        date_of_birth: request.dateOfBirth,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v3/pan/advanced`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'PAN verification failed');
      }

      return result;
    } catch (error) {
      console.error('PAN advanced verification failed:', error);
      throw new Error('Failed to verify PAN with advanced details');
    }
  }

  // Face Liveness Detection
  async initiateFaceLiveness(request: FaceLivenessRequest): Promise<any> {
    try {
      if (!this.isConfigured()) {
        return {
          verification_id: `face_${Date.now()}`,
          liveness_url: 'https://mock-liveness.cashfree.com',
          status: 'initiated',
          expires_at: new Date(Date.now() + 600000).toISOString() // 10 minutes
        };
      }

      const payload = {
        verification_id: request.verificationId,
        liveness_check: true,
        face_match: true,
        quality_check: true,
        consent: 'Y'
      };

      const response = await fetch(`${this.config.baseUrl}/v3/face/liveness`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Face liveness initiation failed');
      }

      return result;
    } catch (error) {
      console.error('Face liveness initiation failed:', error);
      throw new Error('Failed to initiate face liveness detection');
    }
  }

  // Advanced Bank Account Verification with Balance Check
  async verifyBankAdvanced(request: BankAdvancedVerification): Promise<any> {
    try {
      if (!request.bankAccount || request.bankAccount.length < 9) {
        throw new Error('Invalid bank account number');
      }

      if (!this.validateIFSC(request.ifscCode)) {
        throw new Error('Invalid IFSC code');
      }

      if (!this.isConfigured()) {
        return {
          valid: true,
          account_status: 'ACTIVE',
          name_match: 'Y',
          bank_name: 'Mock Bank Ltd',
          branch_name: 'Mock Branch',
          account_type: 'SAVINGS',
          balance_available: request.verifyBalance
        };
      }

      const payload = {
        account_number: request.bankAccount,
        ifsc: request.ifscCode.toUpperCase(),
        name: request.fullName,
        verify_balance: request.verifyBalance || false,
        consent: 'Y',
        consent_purpose: 'Bank account verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v3/bank_account/advanced`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Bank verification failed');
      }

      return result;
    } catch (error) {
      console.error('Bank advanced verification failed:', error);
      throw new Error('Failed to verify bank account with advanced details');
    }
  }

  // Advanced UPI Verification with Balance Check
  async verifyUPIAdvanced(request: UPIAdvancedVerification): Promise<any> {
    try {
      if (!this.validateUPI(request.upiId)) {
        throw new Error('Invalid UPI ID format');
      }

      if (!this.isConfigured()) {
        return {
          valid: true,
          upi_status: 'ACTIVE',
          name_match: 'Y',
          provider: 'Mock@bank',
          account_type: 'INDIVIDUAL',
          balance_available: request.verifyBalance
        };
      }

      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.fullName,
        verify_balance: request.verifyBalance || false,
        consent: 'Y',
        consent_purpose: 'UPI verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v3/upi/advanced`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'UPI verification failed');
      }

      return result;
    } catch (error) {
      console.error('UPI advanced verification failed:', error);
      throw new Error('Failed to verify UPI with advanced details');
    }
  }

  // Name Matching Service
  async verifyNameMatch(request: NameMatchRequest): Promise<any> {
    try {
      if (!this.isConfigured()) {
        return {
          match_percentage: 95,
          match_status: 'HIGH',
          fuzzy_match: true,
          phonetic_match: true
        };
      }

      const payload = {
        primary_name: request.primaryName,
        secondary_name: request.secondaryName,
        match_type: 'comprehensive',
        fuzzy_matching: true,
        phonetic_matching: true
      };

      const response = await fetch(`${this.config.baseUrl}/v3/name/match`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Name matching failed');
      }

      return result;
    } catch (error) {
      console.error('Name matching failed:', error);
      throw new Error('Failed to perform name matching');
    }
  }

  // Comprehensive KYC Verification Process
  async performComprehensiveKYC(request: ComprehensiveKYCRequest): Promise<{
    success: boolean;
    verificationId: string;
    kycLevel: 'basic' | 'enhanced' | 'premium';
    status: 'pending' | 'verified' | 'rejected';
    steps: any[];
    confidence_score: number;
    message: string;
    errors?: string[];
  }> {
    const verificationSteps = [];
    const errors = [];
    let confidenceScore = 0;
    let totalSteps = 0;

    try {
      const verificationId = crypto.randomUUID();
      console.log(`Starting comprehensive KYC for ${request.userAddress}`);

      // Step 1: Digilocker Aadhaar (Premium only)
      if (request.verificationLevel === 'premium') {
        try {
          const digilockerResult = await this.initiateDigilockerAadhaar({
            userAddress: request.userAddress
          });
          verificationSteps.push({ 
            step: 'digilocker_aadhaar', 
            result: digilockerResult, 
            success: digilockerResult.status === 'initiated' 
          });
          if (digilockerResult.status === 'initiated') confidenceScore += 30;
          totalSteps++;
        } catch (error) {
          errors.push('Digilocker Aadhaar verification failed');
          verificationSteps.push({ 
            step: 'digilocker_aadhaar', 
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false 
          });
        }
      }

      // Step 2: Advanced PAN Verification (Required for Enhanced & Premium)
      if (request.panNumber && ['enhanced', 'premium'].includes(request.verificationLevel)) {
        try {
          const panResult = await this.verifyPANAdvanced({
            panNumber: request.panNumber,
            fullName: request.fullName,
            userAddress: request.userAddress
          });
          verificationSteps.push({ 
            step: 'pan_advanced', 
            result: panResult, 
            success: panResult.valid && panResult.name_match === 'Y' 
          });
          if (panResult.valid && panResult.name_match === 'Y') confidenceScore += 25;
          totalSteps++;
        } catch (error) {
          errors.push('PAN advanced verification failed');
          verificationSteps.push({ 
            step: 'pan_advanced', 
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false 
          });
        }
      }

      // Step 3: Face Liveness (Premium only)
      if (request.verificationLevel === 'premium') {
        try {
          const faceResult = await this.initiateFaceLiveness({
            userAddress: request.userAddress,
            verificationId
          });
          verificationSteps.push({ 
            step: 'face_liveness', 
            result: faceResult, 
            success: faceResult.status === 'initiated' 
          });
          if (faceResult.status === 'initiated') confidenceScore += 20;
          totalSteps++;
        } catch (error) {
          errors.push('Face liveness detection failed');
          verificationSteps.push({ 
            step: 'face_liveness', 
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false 
          });
        }
      }

      // Step 4: Bank Account Verification (if provided)
      if (request.bankAccount && request.ifscCode) {
        try {
          const bankResult = await this.verifyBankAdvanced({
            bankAccount: request.bankAccount,
            ifscCode: request.ifscCode,
            fullName: request.fullName,
            userAddress: request.userAddress,
            verifyBalance: request.verificationLevel === 'premium'
          });
          verificationSteps.push({ 
            step: 'bank_advanced', 
            result: bankResult, 
            success: bankResult.valid && bankResult.name_match === 'Y' 
          });
          if (bankResult.valid && bankResult.name_match === 'Y') confidenceScore += 15;
          totalSteps++;
        } catch (error) {
          errors.push('Bank advanced verification failed');
          verificationSteps.push({ 
            step: 'bank_advanced', 
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false 
          });
        }
      }

      // Step 5: UPI Verification (if provided)
      if (request.upiId) {
        try {
          const upiResult = await this.verifyUPIAdvanced({
            upiId: request.upiId,
            fullName: request.fullName,
            userAddress: request.userAddress,
            verifyBalance: request.verificationLevel === 'premium'
          });
          verificationSteps.push({ 
            step: 'upi_advanced', 
            result: upiResult, 
            success: upiResult.valid && upiResult.name_match === 'Y' 
          });
          if (upiResult.valid && upiResult.name_match === 'Y') confidenceScore += 10;
          totalSteps++;
        } catch (error) {
          errors.push('UPI advanced verification failed');
          verificationSteps.push({ 
            step: 'upi_advanced', 
            error: error instanceof Error ? error.message : 'Unknown error', 
            success: false 
          });
        }
      }

      // Calculate final confidence score
      const finalConfidenceScore = totalSteps > 0 ? Math.round(confidenceScore / totalSteps * 100) : 0;
      
      // Determine KYC status based on confidence score and verification level
      let kycStatus: 'pending' | 'verified' | 'rejected' = 'pending';
      
      const thresholds = {
        basic: 60,
        enhanced: 75,
        premium: 90
      };

      if (finalConfidenceScore >= thresholds[request.verificationLevel]) {
        kycStatus = 'verified';
      } else if (finalConfidenceScore < 40) {
        kycStatus = 'rejected';
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
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      console.error('Comprehensive KYC failed:', error);
      return {
        success: false,
        verificationId: '',
        kycLevel: request.verificationLevel,
        status: 'rejected',
        steps: verificationSteps,
        confidence_score: 0,
        message: 'KYC process failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Enhanced INR Transfer Processing
  async processINRTransfer(request: INRWithdrawalRequest): Promise<any> {
    try {
      if (!request.userAddress || !request.usdcAmount || !request.txHash) {
        throw new Error('Missing required withdrawal parameters');
      }

      if (parseFloat(request.usdcAmount) <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      if (!this.isConfigured()) {
        return {
          success: true,
          transfer_id: `transfer_${Date.now()}`,
          status: 'INITIATED',
          amount: request.inrAmount,
          currency: 'INR',
          estimated_completion: '2-4 hours',
          tracking_id: `TRK${Date.now()}`,
          message: 'INR transfer initiated successfully'
        };
      }

      const payload = {
        amount: parseFloat(request.inrAmount),
        currency: 'INR',
        beneficiary: {
          name: request.beneficiaryName,
          account_number: request.verificationType === 'bank' ? request.bankAccount : undefined,
          ifsc: request.verificationType === 'bank' ? request.ifscCode : undefined,
          upi_id: request.verificationType === 'upi' ? request.upiId : undefined
        },
        source_currency: 'USDC',
        source_amount: parseFloat(request.usdcAmount),
        reference_id: request.txHash,
        purpose: 'Cryptocurrency to INR conversion',
        notification_url: `${process.env.WEBHOOK_URL}/cashfree/transfer/webhook`
      };

      const response = await fetch(`${this.config.baseUrl}/../transfers/instant`, {
        method: 'POST',
        headers: this.getHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Transfer initiation failed');
      }

      return result;
    } catch (error) {
      console.error('INR transfer failed:', error);
      throw new Error('Failed to process INR transfer');
    }
  }

  // Get real-time USD to INR exchange rate
  async getExchangeRate(): Promise<number> {
    try {
      // Primary API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (response.ok) {
        const data = await response.json();
        return data.rates.INR || 84.5;
      }

      // Fallback API
      const fallbackResponse = await fetch('https://api.fxratesapi.com/latest?base=USD&symbols=INR');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData.rates.INR || 84.5;
      }

      return 84.5; // Final fallback
    } catch (error) {
      console.error('Exchange rate fetch failed:', error);
      return 84.5;
    }
  }
}

export const cashfreeKYCService = new CashfreeKYCService();
