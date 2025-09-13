// Enhanced KYC Service with specific verification types
import crypto from 'crypto';

// ===== INTERFACES =====

export interface AadhaarOTPRequest {
  aadhaarNumber: string;
  userAddress: string;
  consent: boolean;
}

export interface AadhaarOTPVerifyRequest {
  aadhaarNumber: string;
  otp: string;
  sessionId: string;
  userAddress: string;
}

export interface AadhaarOTPResponse {
  success: boolean;
  sessionId?: string;
  verificationId?: string;
  status: 'otp_sent' | 'verified' | 'failed';
  aadhaarData?: {
    name: string;
    dateOfBirth: string;
    gender: string;
    address: {
      house: string;
      street: string;
      landmark: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
    };
    mobileNumber?: string;
    email?: string;
    photo?: string;
  };
  message: string;
}

export interface PANVerificationRequest {
  panNumber: string;
  fullName: string;
  dateOfBirth?: string;
  userAddress: string;
  consent: boolean;
}

export interface PANVerificationResponse {
  success: boolean;
  verificationId: string;
  panData?: {
    panNumber: string;
    name: string;
    fatherName?: string;
    dateOfBirth?: string;
    panStatus: 'VALID' | 'INVALID' | 'BLOCKED' | 'DEACTIVATED';
    category: 'INDIVIDUAL' | 'COMPANY' | 'HUF' | 'TRUST';
    nameMatch: boolean;
    dobMatch?: boolean;
    isActive: boolean;
    lastUpdated: string;
  };
  message: string;
}

export interface FaceLivenessRequest {
  userAddress: string;
  referencePhoto?: string; // Base64 image for comparison
  verificationId?: string;
}

export interface FaceLivenessResponse {
  success: boolean;
  verificationId: string;
  livenessUrl?: string;
  status: 'initiated' | 'completed' | 'failed';
  livenessResult?: {
    isLive: boolean;
    confidence: number;
    faceMatch?: boolean;
    faceMatchConfidence?: number;
    qualityScore: number;
    spoofingDetected: boolean;
  };
  message: string;
  expiresAt?: string;
}

export interface BankAccountRequest {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  userAddress: string;
  verifyBalance?: boolean;
  consent: boolean;
}

export interface BankAccountResponse {
  success: boolean;
  verificationId: string;
  bankData?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountHolderName: string;
    accountType: 'SAVINGS' | 'CURRENT' | 'NRE' | 'NRO' | 'RECURRING' | 'FIXED';
    accountStatus: 'ACTIVE' | 'INACTIVE' | 'DORMANT' | 'FROZEN';
    nameMatch: boolean;
    balanceAvailable?: boolean;
    lastTransactionDate?: string;
  };
  message: string;
}

export interface UPIVerificationRequest {
  upiId: string;
  accountHolderName: string;
  userAddress: string;
  verifyBalance?: boolean;
  consent: boolean;
}

export interface UPIVerificationResponse {
  success: boolean;
  verificationId: string;
  upiData?: {
    upiId: string;
    accountHolderName: string;
    provider: string;
    bankName: string;
    accountType: 'INDIVIDUAL' | 'MERCHANT';
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    nameMatch: boolean;
    balanceAvailable?: boolean;
    registrationDate?: string;
  };
  message: string;
}

// ===== ENHANCED KYC SERVICE CLASS =====

export class EnhancedKYCService {
  private cashfreeConfig: any;
  private surepassConfig: any;

  constructor() {
    this.cashfreeConfig = {
      apiKey: process.env.CASHFREE_API_KEY || '',
      secretKey: process.env.CASHFREE_SECRET_KEY || '',
      merchantId: process.env.CASHFREE_MERCHANT_ID || '',
      baseUrl: process.env.CASHFREE_ENVIRONMENT === 'production' 
        ? 'https://api.cashfree.com/verification'
        : 'https://sandbox.cashfree.com/verification',
      environment: process.env.CASHFREE_ENVIRONMENT || 'sandbox'
    };

    this.surepassConfig = {
      token: process.env.SUREPASS_TOKEN || '',
      baseUrl: process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io',
      environment: process.env.SUREPASS_ENVIRONMENT || 'production'
    };

    console.log(`Enhanced KYC Service initialized`);
    console.log(`- Cashfree: ${this.cashfreeConfig.environment} mode`);
    console.log(`- SurePass: ${this.surepassConfig.environment} mode`);
  }

  private isConfigured(provider: 'cashfree' | 'surepass'): boolean {
    if (provider === 'cashfree') {
      return !!(this.cashfreeConfig.apiKey && this.cashfreeConfig.secretKey);
    } else {
      return !!this.surepassConfig.token;
    }
  }

  private getCashfreeHeaders(payload?: any): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.cashfreeConfig.apiKey,
      'x-client-secret': this.cashfreeConfig.secretKey,
      'x-timestamp': timestamp,
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.cashfreeConfig.secretKey}`
    };

    if (payload) {
      const signatureData = `${timestamp}${JSON.stringify(payload)}`;
      headers['x-signature'] = crypto.createHmac('sha256', this.cashfreeConfig.secretKey)
        .update(signatureData).digest('hex');
    }

    return headers;
  }

  private getSurePassHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.surepassConfig.token}`,
      'Accept': 'application/json',
      'User-Agent': 'StablePay-KYC/1.0'
    };
  }

  // ===== AADHAAR OTP VERIFICATION =====

  async initiateAadhaarOTP(request: AadhaarOTPRequest): Promise<AadhaarOTPResponse> {
    if (!request.consent) {
      return {
        success: false,
        status: 'failed',
        message: 'User consent is required for Aadhaar verification'
      };
    }

    // Validate Aadhaar format
    const cleanAadhaar = request.aadhaarNumber.replace(/\s/g, '');
    if (!/^[0-9]{12}$/.test(cleanAadhaar)) {
      return {
        success: false,
        status: 'failed',
        message: 'Invalid Aadhaar number format'
      };
    }

    // Try Cashfree first, then SurePass as fallback
    let response = await this.initiateCashfreeAadhaarOTP(request);
    if (!response.success && this.isConfigured('surepass')) {
      response = await this.initiateSurePassAadhaarOTP(request);
    }

    return response;
  }

  private async initiateCashfreeAadhaarOTP(request: AadhaarOTPRequest): Promise<AadhaarOTPResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return this.getMockAadhaarOTPResponse(request, 'otp_sent');
      }

      const payload = {
        aadhaar_number: request.aadhaarNumber.replace(/\s/g, ''),
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/aadhaar/otp`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Aadhaar OTP initiation failed');
      }

      return {
        success: true,
        sessionId: result.session_id || result.verification_id,
        verificationId: result.verification_id,
        status: 'otp_sent',
        message: 'OTP sent successfully to registered mobile number'
      };
    } catch (error) {
      console.error('Cashfree Aadhaar OTP failed:', error);
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to send Aadhaar OTP'
      };
    }
  }

  private async initiateSurePassAadhaarOTP(request: AadhaarOTPRequest): Promise<AadhaarOTPResponse> {
    try {
      const payload = {
        id_number: request.aadhaarNumber.replace(/\s/g, ''),
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/aadhaar-otp`, {
        method: 'POST',
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SurePass Aadhaar OTP failed');
      }

      return {
        success: result.success || false,
        sessionId: result.session_id || result.request_id,
        verificationId: result.verification_id || `surepass_${Date.now()}`,
        status: result.success ? 'otp_sent' : 'failed',
        message: result.message || 'OTP sent successfully'
      };
    } catch (error) {
      console.error('SurePass Aadhaar OTP failed:', error);
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to send Aadhaar OTP'
      };
    }
  }

  async verifyAadhaarOTP(request: AadhaarOTPVerifyRequest): Promise<AadhaarOTPResponse> {
    // Validate OTP format
    if (!/^[0-9]{6}$/.test(request.otp)) {
      return {
        success: false,
        status: 'failed',
        message: 'Invalid OTP format. Please enter 6-digit OTP.'
      };
    }

    // Try Cashfree first, then SurePass
    let response = await this.verifyCashfreeAadhaarOTP(request);
    if (!response.success && this.isConfigured('surepass')) {
      response = await this.verifySurePassAadhaarOTP(request);
    }

    return response;
  }

  private async verifyCashfreeAadhaarOTP(request: AadhaarOTPVerifyRequest): Promise<AadhaarOTPResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return this.getMockAadhaarOTPResponse(request, 'verified');
      }

      const payload = {
        session_id: request.sessionId,
        otp: request.otp
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/aadhaar/otp/verify`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      return {
        success: result.valid || false,
        verificationId: result.verification_id,
        status: result.valid ? 'verified' : 'failed',
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: {
            house: result.data.address?.house || '',
            street: result.data.address?.street || '',
            landmark: result.data.address?.landmark || '',
            area: result.data.address?.area || '',
            city: result.data.address?.city || '',
            state: result.data.address?.state || '',
            pincode: result.data.address?.pincode || ''
          },
          mobileNumber: result.data.mobile,
          email: result.data.email,
          photo: result.data.photo
        } : undefined,
        message: result.valid ? 'Aadhaar verified successfully' : 'Invalid OTP'
      };
    } catch (error) {
      console.error('Cashfree Aadhaar OTP verification failed:', error);
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  private async verifySurePassAadhaarOTP(request: AadhaarOTPVerifyRequest): Promise<AadhaarOTPResponse> {
    try {
      const payload = {
        request_id: request.sessionId,
        otp: request.otp
      };

      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/aadhaar-otp/verify`, {
        method: 'POST',
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SurePass OTP verification failed');
      }

      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_${Date.now()}`,
        status: result.success ? 'verified' : 'failed',
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: {
            house: result.data.address?.house || '',
            street: result.data.address?.street || '',
            landmark: result.data.address?.landmark || '',
            area: result.data.address?.area || '',
            city: result.data.address?.city || '',
            state: result.data.address?.state || '',
            pincode: result.data.address?.pincode || ''
          },
          mobileNumber: result.data.mobile,
          email: result.data.email
        } : undefined,
        message: result.message || (result.success ? 'Aadhaar verified successfully' : 'OTP verification failed')
      };
    } catch (error) {
      console.error('SurePass Aadhaar OTP verification failed:', error);
      return {
        success: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  // ===== PAN VERIFICATION =====

  async verifyPAN(request: PANVerificationRequest): Promise<PANVerificationResponse> {
    if (!request.consent) {
      return {
        success: false,
        verificationId: '',
        message: 'User consent is required for PAN verification'
      };
    }

    // Validate PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(request.panNumber)) {
      return {
        success: false,
        verificationId: '',
        message: 'Invalid PAN format'
      };
    }

    // Try both providers and return the best result
    const cashfreeResult = await this.verifyCashfreePAN(request);
    const surepassResult = await this.verifySurePassPAN(request);

    // Return the successful result, preferring Cashfree
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;

    // If both failed, return the more informative error
    return cashfreeResult.message.length > surepassResult.message.length ? cashfreeResult : surepassResult;
  }

  private async verifyCashfreePAN(request: PANVerificationRequest): Promise<PANVerificationResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return this.getMockPANResponse(request);
      }

      const payload = {
        pan: request.panNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/pan/advanced`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'PAN verification failed');
      }

      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_pan_${Date.now()}`,
        panData: result.valid ? {
          panNumber: result.data?.pan || request.panNumber,
          name: result.data?.name || request.fullName,
          fatherName: result.data?.father_name,
          dateOfBirth: result.data?.dob,
          panStatus: result.data?.status || 'VALID',
          category: result.data?.category || 'INDIVIDUAL',
          nameMatch: result.data?.name_match === 'Y',
          dobMatch: result.data?.dob_match === 'Y',
          isActive: result.valid,
          lastUpdated: new Date().toISOString()
        } : undefined,
        message: result.valid ? 'PAN verified successfully' : result.message || 'PAN verification failed'
      };
    } catch (error) {
      console.error('Cashfree PAN verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'PAN verification failed'
      };
    }
  }

  private async verifySurePassPAN(request: PANVerificationRequest): Promise<PANVerificationResponse> {
    try {
      const payload = {
        id_number: request.panNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/pan-verification`, {
        method: 'POST',
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SurePass PAN verification failed');
      }

      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_pan_${Date.now()}`,
        panData: result.success && result.data ? {
          panNumber: result.data.pan_number,
          name: result.data.name,
          fatherName: result.data.father_name,
          dateOfBirth: result.data.dob,
          panStatus: result.data.pan_status || 'VALID',
          category: result.data.category || 'INDIVIDUAL',
          nameMatch: result.data.name_match !== false,
          dobMatch: result.data.dob_match !== false,
          isActive: result.success,
          lastUpdated: new Date().toISOString()
        } : undefined,
        message: result.message || (result.success ? 'PAN verified successfully' : 'PAN verification failed')
      };
    } catch (error) {
      console.error('SurePass PAN verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'PAN verification failed'
      };
    }
  }

  // ===== FACE LIVENESS DETECTION =====

  async initiateFaceLiveness(request: FaceLivenessRequest): Promise<FaceLivenessResponse> {
    // Try Cashfree first for face liveness
    let response = await this.initiateCashfreeFaceLiveness(request);
    
    // If Cashfree fails and we have SurePass, try it as backup
    if (!response.success && this.isConfigured('surepass')) {
      // Note: SurePass might not have face liveness, so we'll use Cashfree primarily
      response = await this.initiateCashfreeFaceLiveness(request);
    }

    return response;
  }

  private async initiateCashfreeFaceLiveness(request: FaceLivenessRequest): Promise<FaceLivenessResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return {
          success: true,
          verificationId: `mock_face_${Date.now()}`,
          livenessUrl: 'https://mock-liveness.cashfree.com/verify',
          status: 'initiated',
          message: 'Face liveness verification initiated (mock)',
          expiresAt: new Date(Date.now() + 600000).toISOString() // 10 minutes
        };
      }

      const payload = {
        verification_id: request.verificationId || crypto.randomUUID(),
        liveness_check: true,
        face_match: !!request.referencePhoto,
        quality_check: true,
        reference_image: request.referencePhoto,
        consent: 'Y'
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/face/liveness`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Face liveness initiation failed');
      }

      return {
        success: true,
        verificationId: result.verification_id,
        livenessUrl: result.liveness_url,
        status: 'initiated',
        message: 'Face liveness verification initiated successfully',
        expiresAt: result.expires_at
      };
    } catch (error) {
      console.error('Face liveness initiation failed:', error);
      return {
        success: false,
        verificationId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Face liveness initiation failed'
      };
    }
  }

  async checkFaceLivenessStatus(verificationId: string): Promise<FaceLivenessResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return {
          success: true,
          verificationId,
          status: 'completed',
          livenessResult: {
            isLive: true,
            confidence: 0.95,
            faceMatch: true,
            faceMatchConfidence: 0.92,
            qualityScore: 0.88,
            spoofingDetected: false
          },
          message: 'Face liveness verification completed successfully (mock)'
        };
      }

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/face/liveness/status/${verificationId}`, {
        method: 'GET',
        headers: this.getCashfreeHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to check face liveness status');
      }

      return {
        success: true,
        verificationId,
        status: result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'initiated',
        livenessResult: result.liveness_result ? {
          isLive: result.liveness_result.is_live,
          confidence: result.liveness_result.confidence,
          faceMatch: result.liveness_result.face_match,
          faceMatchConfidence: result.liveness_result.face_match_confidence,
          qualityScore: result.liveness_result.quality_score,
          spoofingDetected: result.liveness_result.spoofing_detected
        } : undefined,
        message: result.message || 'Face liveness status retrieved successfully'
      };
    } catch (error) {
      console.error('Face liveness status check failed:', error);
      return {
        success: false,
        verificationId,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to check face liveness status'
      };
    }
  }

  // ===== BANK ACCOUNT VERIFICATION =====

  async verifyBankAccount(request: BankAccountRequest): Promise<BankAccountResponse> {
    if (!request.consent) {
      return {
        success: false,
        verificationId: '',
        message: 'User consent is required for bank account verification'
      };
    }

    // Validate IFSC format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(request.ifscCode)) {
      return {
        success: false,
        verificationId: '',
        message: 'Invalid IFSC code format'
      };
    }

    // Try both providers
    const cashfreeResult = await this.verifyCashfreeBankAccount(request);
    const surepassResult = await this.verifySurePassBankAccount(request);

    // Return successful result, preferring Cashfree
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;

    return cashfreeResult; // Return primary provider result if both failed
  }

  private async verifyCashfreeBankAccount(request: BankAccountRequest): Promise<BankAccountResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return this.getMockBankAccountResponse(request);
      }

      const payload = {
        account_number: request.accountNumber,
        ifsc: request.ifscCode.toUpperCase(),
        name: request.accountHolderName,
        verify_balance: request.verifyBalance || false,
        consent: 'Y',
        consent_purpose: 'Bank account verification for financial services'
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/bank_account/advanced`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Bank account verification failed');
      }

      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_bank_${Date.now()}`,
        bankData: result.valid ? {
          accountNumber: request.accountNumber,
          ifscCode: request.ifscCode.toUpperCase(),
          bankName: result.data?.bank_name || 'Unknown Bank',
          branchName: result.data?.branch_name || 'Unknown Branch',
          accountHolderName: result.data?.account_holder_name || request.accountHolderName,
          accountType: result.data?.account_type || 'SAVINGS',
          accountStatus: result.data?.account_status || 'ACTIVE',
          nameMatch: result.data?.name_match === 'Y',
          balanceAvailable: result.data?.balance_available,
          lastTransactionDate: result.data?.last_transaction_date
        } : undefined,
        message: result.valid ? 'Bank account verified successfully' : result.message || 'Bank account verification failed'
      };
    } catch (error) {
      console.error('Cashfree bank account verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'Bank account verification failed'
      };
    }
  }

  private async verifySurePassBankAccount(request: BankAccountRequest): Promise<BankAccountResponse> {
    try {
      const payload = {
        account_number: request.accountNumber,
        ifsc_code: request.ifscCode.toUpperCase(),
        name: request.accountHolderName,
        consent: 'Y',
        consent_purpose: 'Bank account verification for financial services'
      };

      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/bank-verification`, {
        method: 'POST',
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SurePass bank verification failed');
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
          accountType: result.data.account_type || 'SAVINGS',
          accountStatus: result.data.account_status || 'ACTIVE',
          nameMatch: result.data.name_match !== false,
          balanceAvailable: result.data.balance_available,
          lastTransactionDate: result.data.last_transaction_date
        } : undefined,
        message: result.message || (result.success ? 'Bank account verified successfully' : 'Bank verification failed')
      };
    } catch (error) {
      console.error('SurePass bank verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'Bank account verification failed'
      };
    }
  }

  // ===== UPI VERIFICATION =====

  async verifyUPI(request: UPIVerificationRequest): Promise<UPIVerificationResponse> {
    if (!request.consent) {
      return {
        success: false,
        verificationId: '',
        message: 'User consent is required for UPI verification'
      };
    }

    // Validate UPI format
    if (!/^[\w.-]+@[\w.-]+$/.test(request.upiId)) {
      return {
        success: false,
        verificationId: '',
        message: 'Invalid UPI ID format'
      };
    }

    // Try both providers
    const cashfreeResult = await this.verifyCashfreeUPI(request);
    const surepassResult = await this.verifySurePassUPI(request);

    // Return successful result, preferring Cashfree
    if (cashfreeResult.success) return cashfreeResult;
    if (surepassResult.success) return surepassResult;

    return cashfreeResult;
  }

  private async verifyCashfreeUPI(request: UPIVerificationRequest): Promise<UPIVerificationResponse> {
    try {
      if (!this.isConfigured('cashfree')) {
        return this.getMockUPIResponse(request);
      }

      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.accountHolderName,
        verify_balance: request.verifyBalance || false,
        consent: 'Y',
        consent_purpose: 'UPI verification for financial services'
      };

      const response = await fetch(`${this.cashfreeConfig.baseUrl}/v3/upi/advanced`, {
        method: 'POST',
        headers: this.getCashfreeHeaders(payload),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'UPI verification failed');
      }

      return {
        success: result.valid || false,
        verificationId: result.verification_id || `cashfree_upi_${Date.now()}`,
        upiData: result.valid ? {
          upiId: request.upiId,
          accountHolderName: result.data?.account_holder_name || request.accountHolderName,
          provider: result.data?.provider || request.upiId.split('@')[1],
          bankName: result.data?.bank_name || 'Unknown Bank',
          accountType: result.data?.account_type || 'INDIVIDUAL',
          status: result.data?.status || 'ACTIVE',
          nameMatch: result.data?.name_match === 'Y',
          balanceAvailable: result.data?.balance_available,
          registrationDate: result.data?.registration_date
        } : undefined,
        message: result.valid ? 'UPI verified successfully' : result.message || 'UPI verification failed'
      };
    } catch (error) {
      console.error('Cashfree UPI verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'UPI verification failed'
      };
    }
  }

  private async verifySurePassUPI(request: UPIVerificationRequest): Promise<UPIVerificationResponse> {
    try {
      const payload = {
        upi_id: request.upiId.toLowerCase(),
        name: request.accountHolderName,
        consent: 'Y',
        consent_purpose: 'UPI verification for financial services'
      };

      const response = await fetch(`${this.surepassConfig.baseUrl}/v1/upi-verification`, {
        method: 'POST',
        headers: this.getSurePassHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'SurePass UPI verification failed');
      }

      return {
        success: result.success || false,
        verificationId: result.verification_id || `surepass_upi_${Date.now()}`,
        upiData: result.success && result.data ? {
          upiId: request.upiId,
          accountHolderName: result.data.account_holder_name,
          provider: result.data.provider,
          bankName: result.data.bank_name,
          accountType: result.data.account_type || 'INDIVIDUAL',
          status: result.data.status || 'ACTIVE',
          nameMatch: result.data.name_match !== false,
          balanceAvailable: result.data.balance_available,
          registrationDate: result.data.registration_date
        } : undefined,
        message: result.message || (result.success ? 'UPI verified successfully' : 'UPI verification failed')
      };
    } catch (error) {
      console.error('SurePass UPI verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'UPI verification failed'
      };
    }
  }

  // ===== MOCK RESPONSES FOR TESTING =====

  private getMockAadhaarOTPResponse(request: any, status: 'otp_sent' | 'verified'): AadhaarOTPResponse {
    if (status === 'otp_sent') {
      return {
        success: true,
        sessionId: `mock_session_${Date.now()}`,
        verificationId: `mock_aadhaar_${Date.now()}`,
        status: 'otp_sent',
        message: 'OTP sent successfully to registered mobile number (mock)'
      };
    }

    return {
      success: true,
      verificationId: `mock_aadhaar_${Date.now()}`,
      status: 'verified',
      aadhaarData: {
        name: 'Mock User Name',
        dateOfBirth: '1990-01-01',
        gender: 'M',
        address: {
          house: '123',
          street: 'Mock Street',
          landmark: 'Near Mock Landmark',
          area: 'Mock Area',
          city: 'Mock City',
          state: 'Mock State',
          pincode: '123456'
        },
        mobileNumber: '9876543210',
        email: 'mockuser@example.com'
      },
      message: 'Aadhaar verified successfully (mock)'
    };
  }

  private getMockPANResponse(request: PANVerificationRequest): PANVerificationResponse {
    return {
      success: true,
      verificationId: `mock_pan_${Date.now()}`,
      panData: {
        panNumber: request.panNumber.toUpperCase(),
        name: request.fullName,
        fatherName: 'Mock Father Name',
        dateOfBirth: request.dateOfBirth || '1990-01-01',
        panStatus: 'VALID',
        category: 'INDIVIDUAL',
        nameMatch: true,
        dobMatch: !!request.dateOfBirth,
        isActive: true,
        lastUpdated: new Date().toISOString()
      },
      message: 'PAN verified successfully (mock)'
    };
  }

  private getMockBankAccountResponse(request: BankAccountRequest): BankAccountResponse {
    return {
      success: true,
      verificationId: `mock_bank_${Date.now()}`,
      bankData: {
        accountNumber: request.accountNumber,
        ifscCode: request.ifscCode.toUpperCase(),
        bankName: 'Mock Bank Limited',
        branchName: 'Mock Branch',
        accountHolderName: request.accountHolderName,
        accountType: 'SAVINGS',
        accountStatus: 'ACTIVE',
        nameMatch: true,
        balanceAvailable: request.verifyBalance,
        lastTransactionDate: new Date(Date.now() - 86400000).toISOString()
      },
      message: 'Bank account verified successfully (mock)'
    };
  }

  private getMockUPIResponse(request: UPIVerificationRequest): UPIVerificationResponse {
    return {
      success: true,
      verificationId: `mock_upi_${Date.now()}`,
      upiData: {
        upiId: request.upiId,
        accountHolderName: request.accountHolderName,
        provider: request.upiId.split('@')[1] || 'mockbank',
        bankName: 'Mock Bank Limited',
        accountType: 'INDIVIDUAL',
        status: 'ACTIVE',
        nameMatch: true,
        balanceAvailable: request.verifyBalance,
        registrationDate: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      message: 'UPI verified successfully (mock)'
    };
  }
}

export const enhancedKYCService = new EnhancedKYCService();
