// Import environment configuration FIRST
import crypto from 'crypto';

export interface SurePassConfig {
  token: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export interface SurePassAadhaarRequest {
  aadhaarNumber: string;
  userAddress: string;
  consent: boolean;
}

export interface SurePassAadhaarResponse {
  success: boolean;
  verificationId: string;
  status: 'initiated' | 'completed' | 'failed';
  aadhaarData?: {
    name: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    mobileNumber?: string;
    isValid: boolean;
  };
  message: string;
}

export interface SurePassPANRequest {
  panNumber: string;
  fullName: string;
  userAddress: string;
  consent: boolean;
}

export interface SurePassPANResponse {
  success: boolean;
  verificationId: string;
  panData?: {
    panNumber: string;
    name: string;
    fatherName?: string;
    dateOfBirth?: string;
    isValid: boolean;
    panStatus: string;
    nameMatch: boolean;
  };
  message: string;
}

export interface SurePassVoterIdRequest {
  voterIdNumber: string;
  fullName: string;
  userAddress: string;
  state?: string;
  consent: boolean;
}

export interface SurePassVoterIdResponse {
  success: boolean;
  verificationId: string;
  voterData?: {
    voterIdNumber: string;
    name: string;
    fatherName?: string;
    dateOfBirth?: string;
    address: string;
    isValid: boolean;
    nameMatch: boolean;
  };
  message: string;
}

export interface SurePassDrivingLicenseRequest {
  dlNumber: string;
  fullName: string;
  dateOfBirth: string;
  userAddress: string;
  consent: boolean;
}

export interface SurePassDrivingLicenseResponse {
  success: boolean;
  verificationId: string;
  dlData?: {
    dlNumber: string;
    name: string;
    dateOfBirth: string;
    address: string;
    issueDate: string;
    expiryDate: string;
    isValid: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
  };
  message: string;
}

export interface SurePassPhoneRequest {
  phoneNumber: string;
  userAddress: string;
  consent: boolean;
}

export interface SurePassPhoneResponse {
  success: boolean;
  verificationId: string;
  phoneData?: {
    phoneNumber: string;
    operator: string;
    circle: string;
    isActive: boolean;
    isValid: boolean;
  };
  message: string;
}

export class SurePassKYCService {
  private config: SurePassConfig;

  constructor() {
    this.config = {
      token: process.env.SUREPASS_TOKEN || '',
      baseUrl: process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io',
      environment: (process.env.SUREPASS_ENVIRONMENT as 'sandbox' | 'production') || 'production'
    };

    console.log(`SurePass KYC Service initialized in ${this.config.environment} mode`);

    if (!this.isConfigured()) {
      console.warn('SurePass API credentials not configured. Using mock responses.');
    }
  }

  private isConfigured(): boolean {
    return !!(this.config.token && this.config.baseUrl);
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.token}`,
      'Accept': 'application/json',
      'User-Agent': 'StablePay-KYC/1.0'
    };
  }

  private validateAadhaar(aadhaar: string): boolean {
    const clean = aadhaar.replace(/\s/g, '');
    return /^[0-9]{12}$/.test(clean);
  }

  private validatePAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }

  private validatePhone(phone: string): boolean {
    const clean = phone.replace(/[^\d]/g, '');
    return /^[6-9]\d{9}$/.test(clean);
  }

  private validateVoterId(voterId: string): boolean {
    return /^[A-Z]{3}[0-9]{7}$/.test(voterId);
  }

  private validateDrivingLicense(dl: string): boolean {
    // Basic validation for Indian driving license formats
    return /^[A-Z]{2}[-]?[0-9]{2}[-]?[0-9]{4}[-]?[0-9]{7}$/.test(dl) || 
           /^[A-Z]{2}[0-9]{13}$/.test(dl);
  }

  // Aadhaar Verification
  async verifyAadhaar(request: SurePassAadhaarRequest): Promise<SurePassAadhaarResponse> {
    try {
      if (!request.consent) {
        throw new Error('User consent is required for Aadhaar verification');
      }

      if (!this.validateAadhaar(request.aadhaarNumber)) {
        throw new Error('Invalid Aadhaar number format');
      }

      if (!this.isConfigured()) {
        // Mock response for development
        return {
          success: true,
          verificationId: `surepass_aadhaar_${Date.now()}`,
          status: 'completed',
          aadhaarData: {
            name: 'Mock User Name',
            dateOfBirth: '1990-01-01',
            gender: 'M',
            address: 'Mock Address, Mock City, Mock State',
            isValid: true
          },
          message: 'Aadhaar verification completed successfully (mock)'
        };
      }

      const payload = {
        id_number: request.aadhaarNumber.replace(/\s/g, ''),
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v1/aadhaar-verification`, {
        method: 'POST',
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
        status: result.success ? 'completed' : 'failed',
        aadhaarData: result.data ? {
          name: result.data.name,
          dateOfBirth: result.data.dob,
          gender: result.data.gender,
          address: result.data.address,
          mobileNumber: result.data.mobile,
          isValid: result.success
        } : undefined,
        message: result.message || 'Aadhaar verification completed'
      };
    } catch (error) {
      console.error('SurePass Aadhaar verification failed:', error);
      return {
        success: false,
        verificationId: '',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Aadhaar verification failed'
      };
    }
  }

  // PAN Verification
  async verifyPAN(request: SurePassPANRequest): Promise<SurePassPANResponse> {
    try {
      if (!request.consent) {
        throw new Error('User consent is required for PAN verification');
      }

      if (!this.validatePAN(request.panNumber)) {
        throw new Error('Invalid PAN format');
      }

      if (!this.isConfigured()) {
        // Mock response for development
        return {
          success: true,
          verificationId: `surepass_pan_${Date.now()}`,
          panData: {
            panNumber: request.panNumber.toUpperCase(),
            name: request.fullName,
            isValid: true,
            panStatus: 'VALID',
            nameMatch: true
          },
          message: 'PAN verification completed successfully (mock)'
        };
      }

      const payload = {
        id_number: request.panNumber.toUpperCase(),
        name: request.fullName,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v1/pan-verification`, {
        method: 'POST',
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
          panStatus: result.data.pan_status || 'VALID',
          nameMatch: result.data.name_match || true
        } : undefined,
        message: result.message || 'PAN verification completed'
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

  // Voter ID Verification
  async verifyVoterId(request: SurePassVoterIdRequest): Promise<SurePassVoterIdResponse> {
    try {
      if (!request.consent) {
        throw new Error('User consent is required for Voter ID verification');
      }

      if (!this.validateVoterId(request.voterIdNumber)) {
        throw new Error('Invalid Voter ID format');
      }

      if (!this.isConfigured()) {
        // Mock response for development
        return {
          success: true,
          verificationId: `surepass_voter_${Date.now()}`,
          voterData: {
            voterIdNumber: request.voterIdNumber.toUpperCase(),
            name: request.fullName,
            address: 'Mock Address, Mock City, Mock State',
            isValid: true,
            nameMatch: true
          },
          message: 'Voter ID verification completed successfully (mock)'
        };
      }

      const payload = {
        id_number: request.voterIdNumber.toUpperCase(),
        name: request.fullName,
        state: request.state,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v1/voter-id-verification`, {
        method: 'POST',
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
        } : undefined,
        message: result.message || 'Voter ID verification completed'
      };
    } catch (error) {
      console.error('SurePass Voter ID verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'Voter ID verification failed'
      };
    }
  }

  // Driving License Verification
  async verifyDrivingLicense(request: SurePassDrivingLicenseRequest): Promise<SurePassDrivingLicenseResponse> {
    try {
      if (!request.consent) {
        throw new Error('User consent is required for Driving License verification');
      }

      if (!this.validateDrivingLicense(request.dlNumber)) {
        throw new Error('Invalid Driving License format');
      }

      if (!this.isConfigured()) {
        // Mock response for development
        return {
          success: true,
          verificationId: `surepass_dl_${Date.now()}`,
          dlData: {
            dlNumber: request.dlNumber.toUpperCase(),
            name: request.fullName,
            dateOfBirth: request.dateOfBirth,
            address: 'Mock Address, Mock City, Mock State',
            issueDate: '2020-01-01',
            expiryDate: '2040-01-01',
            isValid: true,
            nameMatch: true,
            dobMatch: true
          },
          message: 'Driving License verification completed successfully (mock)'
        };
      }

      const payload = {
        id_number: request.dlNumber.toUpperCase(),
        name: request.fullName,
        dob: request.dateOfBirth,
        consent: 'Y',
        consent_purpose: 'Identity verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v1/driving-license-verification`, {
        method: 'POST',
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
        } : undefined,
        message: result.message || 'Driving License verification completed'
      };
    } catch (error) {
      console.error('SurePass Driving License verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'Driving License verification failed'
      };
    }
  }

  // Phone Number Verification
  async verifyPhone(request: SurePassPhoneRequest): Promise<SurePassPhoneResponse> {
    try {
      if (!request.consent) {
        throw new Error('User consent is required for phone verification');
      }

      if (!this.validatePhone(request.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      if (!this.isConfigured()) {
        // Mock response for development
        return {
          success: true,
          verificationId: `surepass_phone_${Date.now()}`,
          phoneData: {
            phoneNumber: request.phoneNumber,
            operator: 'Mock Telecom',
            circle: 'Mock Circle',
            isActive: true,
            isValid: true
          },
          message: 'Phone verification completed successfully (mock)'
        };
      }

      const payload = {
        phone_number: request.phoneNumber.replace(/[^\d]/g, ''),
        consent: 'Y',
        consent_purpose: 'Phone verification for financial services'
      };

      const response = await fetch(`${this.config.baseUrl}/v1/phone-verification`, {
        method: 'POST',
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
        } : undefined,
        message: result.message || 'Phone verification completed'
      };
    } catch (error) {
      console.error('SurePass Phone verification failed:', error);
      return {
        success: false,
        verificationId: '',
        message: error instanceof Error ? error.message : 'Phone verification failed'
      };
    }
  }

  // Comprehensive Multi-Document Verification
  async performMultiDocumentKYC(documents: {
    aadhaar?: string;
    pan?: string;
    voterId?: string;
    drivingLicense?: string;
    phone?: string;
  }, userInfo: {
    fullName: string;
    dateOfBirth?: string;
    userAddress: string;
  }): Promise<{
    success: boolean;
    verificationId: string;
    results: any[];
    confidenceScore: number;
    status: 'verified' | 'partial' | 'failed';
    message: string;
  }> {
    const results: any[] = [];
    let successCount = 0;
    let totalVerifications = 0;

    try {
      const verificationId = crypto.randomUUID();

      // Aadhaar verification
      if (documents.aadhaar) {
        totalVerifications++;
        const aadhaarResult = await this.verifyAadhaar({
          aadhaarNumber: documents.aadhaar,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: 'aadhaar', result: aadhaarResult });
        if (aadhaarResult.success) successCount++;
      }

      // PAN verification
      if (documents.pan) {
        totalVerifications++;
        const panResult = await this.verifyPAN({
          panNumber: documents.pan,
          fullName: userInfo.fullName,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: 'pan', result: panResult });
        if (panResult.success) successCount++;
      }

      // Voter ID verification
      if (documents.voterId) {
        totalVerifications++;
        const voterResult = await this.verifyVoterId({
          voterIdNumber: documents.voterId,
          fullName: userInfo.fullName,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: 'voter_id', result: voterResult });
        if (voterResult.success) successCount++;
      }

      // Driving License verification
      if (documents.drivingLicense && userInfo.dateOfBirth) {
        totalVerifications++;
        const dlResult = await this.verifyDrivingLicense({
          dlNumber: documents.drivingLicense,
          fullName: userInfo.fullName,
          dateOfBirth: userInfo.dateOfBirth,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: 'driving_license', result: dlResult });
        if (dlResult.success) successCount++;
      }

      // Phone verification
      if (documents.phone) {
        totalVerifications++;
        const phoneResult = await this.verifyPhone({
          phoneNumber: documents.phone,
          userAddress: userInfo.userAddress,
          consent: true
        });
        results.push({ type: 'phone', result: phoneResult });
        if (phoneResult.success) successCount++;
      }

      // Calculate confidence score
      const confidenceScore = totalVerifications > 0 ? (successCount / totalVerifications) * 100 : 0;

      // Determine overall status
      let status: 'verified' | 'partial' | 'failed' = 'failed';
      if (confidenceScore >= 80) {
        status = 'verified';
      } else if (confidenceScore >= 50) {
        status = 'partial';
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
      console.error('Multi-document KYC failed:', error);
      return {
        success: false,
        verificationId: '',
        results,
        confidenceScore: 0,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Multi-document KYC failed'
      };
    }
  }
}

export const surePassKYCService = new SurePassKYCService();
