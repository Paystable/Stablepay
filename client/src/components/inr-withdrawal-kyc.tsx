
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  User, 
  FileText, 
  Building2, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Camera,
  Fingerprint,
  CreditCard,
  Smartphone,
  Lock,
  Unlock
} from 'lucide-react';
import { CONTRACTS } from '../lib/vault-contract';

interface KYCForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  panNumber: string;
  bankAccount: string;
  ifscCode: string;
  upiId: string;
}

interface WithdrawalForm {
  amount: string;
  verificationType: 'bank' | 'upi';
  beneficiaryName: string;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  confidence?: number;
}

export default function ComprehensiveINRWithdrawalKYC() {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // States
  const [activeStep, setActiveStep] = useState<'kyc' | 'withdrawal'>('kyc');
  const [currentKYCStep, setCurrentKYCStep] = useState(0);
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [verificationLevel, setVerificationLevel] = useState<'basic' | 'enhanced' | 'premium'>('premium');

  const [kycForm, setKycForm] = useState<KYCForm>({
    fullName: '',
    email: '',
    phoneNumber: '',
    panNumber: '',
    bankAccount: '',
    ifscCode: '',
    upiId: ''
  });

  const [withdrawalForm, setWithdrawalForm] = useState<WithdrawalForm>({
    amount: '',
    verificationType: 'bank',
    beneficiaryName: ''
  });

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'digilocker',
      title: 'Digilocker Aadhaar',
      description: 'Secure document verification via Digilocker',
      icon: FileText,
      status: 'pending'
    },
    {
      id: 'pan_advanced',
      title: 'Advanced PAN Verification',
      description: 'PAN card verification with name matching',
      icon: CreditCard,
      status: 'pending'
    },
    {
      id: 'face_liveness',
      title: 'Face Liveness Detection',
      description: 'Live selfie verification for security',
      icon: Camera,
      status: 'pending'
    },
    {
      id: 'bank_advanced',
      title: 'Bank Account Verification',
      description: 'Advanced bank account validation',
      icon: Building2,
      status: 'pending'
    },
    {
      id: 'name_match',
      title: 'Name Matching',
      description: 'Cross-verification of names across documents',
      icon: User,
      status: 'pending'
    }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessages, setSuccessMessages] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(84.5);
  const [digilockerUrl, setDigilockerUrl] = useState<string>('');
  const [faceLivenessUrl, setFaceLivenessUrl] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');

  // Validation functions
  const validatePAN = (pan: string): boolean => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateIFSC = (ifsc: string): boolean => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const validateUPI = (upi: string): boolean => /^[\w.-]+@[\w.-]+$/.test(upi);
  const validateBankAccount = (account: string): boolean => /^[0-9]{9,20}$/.test(account);
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => setErrors({});

  // Check KYC status on component mount
  useEffect(() => {
    if (address) {
      checkKYCStatus();
      fetchExchangeRate();
    }
  }, [address]);

  const checkKYCStatus = async () => {
    try {
      const response = await fetch(`/api/kyc/status/${address}`);
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.status);
        if (data.status === 'verified') {
          setActiveStep('withdrawal');
          setCurrentKYCStep(4);
        }
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate/usd-inr');
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    clearAllErrors();
    let isValid = true;

    switch (currentKYCStep) {
      case 0: // Personal Information
        if (!kycForm.fullName.trim()) {
          setError('fullName', 'Full name is required');
          isValid = false;
        }
        if (!kycForm.email.trim()) {
          setError('email', 'Email is required');
          isValid = false;
        } else if (!validateEmail(kycForm.email)) {
          setError('email', 'Invalid email format');
          isValid = false;
        }
        if (!kycForm.phoneNumber.trim()) {
          setError('phoneNumber', 'Phone number is required');
          isValid = false;
        } else if (!validatePhone(kycForm.phoneNumber)) {
          setError('phoneNumber', 'Invalid phone number (10 digits starting with 6-9)');
          isValid = false;
        }
        break;

      case 1: // Document Verification
        if (!kycForm.panNumber.trim()) {
          setError('panNumber', 'PAN number is required');
          isValid = false;
        } else if (!validatePAN(kycForm.panNumber)) {
          setError('panNumber', 'Invalid PAN format (ABCDE1234F)');
          isValid = false;
        }
        break;

      case 2: // Banking Details
        if (kycForm.bankAccount && !validateBankAccount(kycForm.bankAccount)) {
          setError('bankAccount', 'Bank account must be 9-20 digits');
          isValid = false;
        } else if (kycForm.bankAccount && !kycForm.ifscCode) {
          setError('ifscCode', 'IFSC code is required with bank account');
          isValid = false;
        } else if (kycForm.bankAccount && !validateIFSC(kycForm.ifscCode)) {
          setError('ifscCode', 'Invalid IFSC code format');
          isValid = false;
        }

        if (kycForm.upiId && !validateUPI(kycForm.upiId)) {
          setError('upiId', 'Invalid UPI ID format');
          isValid = false;
        }

        if (!kycForm.bankAccount && !kycForm.upiId) {
          setError('payment', 'Please provide either bank account details or UPI ID');
          isValid = false;
        }
        break;
    }

    return isValid;
  };

  // Step 1: Initiate Digilocker Aadhaar Verification
  const initiateDigilockerVerification = async () => {
    try {
      const response = await fetch('/api/kyc/digilocker/aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address })
      });

      const result = await response.json();

      if (result.success) {
        setDigilockerUrl(result.consentUrl);
        setVerificationId(result.verificationId);
        updateVerificationStep('digilocker', 'in_progress');

        // Open Digilocker in new window
        window.open(result.consentUrl, '_blank');

        setSuccessMessages(prev => [...prev, '✅ Digilocker verification initiated. Please complete in the new window.']);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError('digilocker', error instanceof Error ? error.message : 'Digilocker initiation failed');
      updateVerificationStep('digilocker', 'failed');
    }
  };

  // Step 2: Initiate Face Liveness Detection
  const initiateFaceLiveness = async () => {
    try {
      const response = await fetch('/api/kyc/face/liveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userAddress: address,
          verificationId
        })
      });

      const result = await response.json();

      if (result.success) {
        setFaceLivenessUrl(result.liveness_url);
        updateVerificationStep('face_liveness', 'in_progress');

        // Open face liveness in new window
        window.open(result.liveness_url, '_blank');

        setSuccessMessages(prev => [...prev, '✅ Face liveness detection initiated. Please complete in the new window.']);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError('face_liveness', error instanceof Error ? error.message : 'Face liveness initiation failed');
      updateVerificationStep('face_liveness', 'failed');
    }
  };

  // Update verification step status
  const updateVerificationStep = (stepId: string, status: VerificationStep['status'], confidence?: number) => {
    setVerificationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, confidence } : step
    ));
  };

  // Complete comprehensive KYC verification
  const handleComprehensiveKYC = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsVerifying(true);
    clearAllErrors();

    try {
      const response = await fetch('/api/kyc/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          fullName: kycForm.fullName,
          email: kycForm.email,
          phone: kycForm.phoneNumber,
          panNumber: kycForm.panNumber,
          bankAccount: kycForm.bankAccount || undefined,
          ifscCode: kycForm.ifscCode || undefined,
          upiId: kycForm.upiId || undefined,
          verificationLevel
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update verification steps based on results
        result.steps.forEach((step: any) => {
          const stepId = step.step;
          const status = step.success ? 'completed' : 'failed';
          updateVerificationStep(stepId, status, step.confidence);
        });

        if (result.status === 'verified') {
          setKycStatus('verified');
          setActiveStep('withdrawal');
          setSuccessMessages(prev => [...prev, 
            '🎉 Comprehensive KYC verification completed successfully!',
            `🏆 Verification confidence: ${result.confidence_score}%`,
            '💰 You can now withdraw USDC to INR instantly'
          ]);
        } else if (result.status === 'pending') {
          setError('general', 'KYC verification is under manual review. This may take 24-48 hours.');
        } else {
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error: string, index: number) => {
              setError(`error_${index}`, error);
            });
          } else {
            setError('general', result.message || 'KYC verification failed');
          }
        }
      } else {
        setError('general', result.error || 'KYC verification failed');
      }
    } catch (error) {
      console.error('Comprehensive KYC error:', error);
      setError('general', 'KYC verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle enhanced INR withdrawal
  const handleEnhancedWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
      setError('amount', 'Please enter a valid amount');
      return;
    }

    if (!withdrawalForm.beneficiaryName.trim()) {
      setError('beneficiaryName', 'Beneficiary name is required');
      return;
    }

    setIsWithdrawing(true);
    clearAllErrors();

    try {
      // First, initiate blockchain withdrawal
      const amountWei = parseUnits(withdrawalForm.amount, 6); // USDC has 6 decimals

      writeContract({
        address: CONTRACTS.STABLE_PAY_VAULT as `0x${string}`,
        abi: [
          {
            name: 'withdraw',
            type: 'function',
            inputs: [
              { name: 'assets', type: 'uint256' },
              { name: 'receiver', type: 'address' },
              { name: 'owner', type: 'address' }
            ],
            outputs: [{ name: 'shares', type: 'uint256' }]
          }
        ],
        functionName: 'withdraw',
        args: [amountWei, address, address]
      });

      // Mock transaction hash for demo
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Process enhanced INR withdrawal
      const response = await fetch('/api/withdraw/inr/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          amount: withdrawalForm.amount,
          txHash: mockTxHash,
          verificationType: withdrawalForm.verificationType,
          bankAccount: withdrawalForm.verificationType === 'bank' ? kycForm.bankAccount : undefined,
          ifscCode: withdrawalForm.verificationType === 'bank' ? kycForm.ifscCode : undefined,
          upiId: withdrawalForm.verificationType === 'upi' ? kycForm.upiId : undefined,
          beneficiaryName: withdrawalForm.beneficiaryName
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessages(prev => [...prev,
          '🎉 Enhanced INR withdrawal initiated successfully!',
          `💰 Amount: ₹${result.inrAmount.toLocaleString()}`,
          `📈 Exchange Rate: ₹${result.exchangeRate}`,
          `⏱️ Estimated Time: ${result.estimatedTime}`,
          `🆔 Transfer ID: ${result.transferId}`
        ]);

        // Reset withdrawal form
        setWithdrawalForm({
          amount: '',
          verificationType: 'bank',
          beneficiaryName: ''
        });
      } else {
        setError('withdrawal', result.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Enhanced withdrawal error:', error);
      setError('withdrawal', 'Withdrawal failed. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Progress calculation
  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = verificationSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentKYCStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentKYCStep(prev => Math.max(prev - 1, 0));
  };

  if (!address) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Connect Wallet Required
          </CardTitle>
          <CardDescription>
            Please connect your wallet to access INR withdrawal with comprehensive KYC verification
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#6667AB]" />
            Comprehensive INR Withdrawal with Enhanced KYC
          </CardTitle>
          <CardDescription>
            Complete advanced KYC verification with Digilocker, face liveness, and instant INR withdrawals
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Verification Progress</span>
              <Badge variant={kycStatus === 'verified' ? 'default' : 'secondary'}>
                {kycStatus === 'verified' ? 'Verified' : kycStatus === 'pending' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {verificationSteps.map((step) => {
                const IconComponent = step.icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      step.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{step.title}</div>
                      <div className="text-xs text-gray-500 truncate">{step.description}</div>
                      {step.confidence && (
                        <div className="text-xs text-green-600">{step.confidence}% confidence</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as 'kyc' | 'withdrawal')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kyc" disabled={kycStatus === 'verified'}>
            <Shield className="h-4 w-4 mr-2" />
            KYC Verification
          </TabsTrigger>
          <TabsTrigger value="withdrawal" disabled={kycStatus !== 'verified'}>
            <CreditCard className="h-4 w-4 mr-2" />
            INR Withdrawal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive KYC Verification</CardTitle>
              <CardDescription>
                Complete all verification steps for enhanced security and instant withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KYC Form Steps */}
              {currentKYCStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={kycForm.fullName}
                        onChange={(e) => {
                          setKycForm(prev => ({ ...prev, fullName: e.target.value }));
                          clearError('fullName');
                        }}
                        className={errors.fullName ? 'border-red-300' : ''}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={kycForm.email}
                        onChange={(e) => {
                          setKycForm(prev => ({ ...prev, email: e.target.value }));
                          clearError('email');
                        }}
                        className={errors.email ? 'border-red-300' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={kycForm.phoneNumber}
                        onChange={(e) => {
                          setKycForm(prev => ({ ...prev, phoneNumber: e.target.value }));
                          clearError('phoneNumber');
                        }}
                        className={errors.phoneNumber ? 'border-red-300' : ''}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentKYCStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Document Verification</h3>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="panNumber">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        placeholder="ABCDE1234F"
                        value={kycForm.panNumber}
                        onChange={(e) => {
                          setKycForm(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }));
                          clearError('panNumber');
                        }}
                        className={errors.panNumber ? 'border-red-300' : ''}
                      />
                      {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                    </div>

                    {/* Digilocker Initiation */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Digilocker Aadhaar Verification
                      </h4>
                      <p className="text-sm text-gray-600">
                        Secure verification through Government of India's Digilocker platform
                      </p>
                      <Button 
                        onClick={initiateDigilockerVerification}
                        variant="outline"
                        className="w-full"
                        disabled={verificationSteps.find(s => s.id === 'digilocker')?.status === 'in_progress'}
                      >
                        {verificationSteps.find(s => s.id === 'digilocker')?.status === 'in_progress' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verification in Progress
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Start Digilocker Verification
                          </>
                        )}
                      </Button>
                      {errors.digilocker && <p className="text-red-500 text-xs">{errors.digilocker}</p>}
                    </div>

                    {/* Face Liveness */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Face Liveness Detection
                      </h4>
                      <p className="text-sm text-gray-600">
                        Live selfie verification for enhanced security
                      </p>
                      <Button 
                        onClick={initiateFaceLiveness}
                        variant="outline"
                        className="w-full"
                        disabled={verificationSteps.find(s => s.id === 'face_liveness')?.status === 'in_progress' || !verificationId}
                      >
                        {verificationSteps.find(s => s.id === 'face_liveness')?.status === 'in_progress' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Liveness Check in Progress
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Start Face Liveness Check
                          </>
                        )}
                      </Button>
                      {errors.face_liveness && <p className="text-red-500 text-xs">{errors.face_liveness}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentKYCStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Banking Details</h3>
                  <div className="grid gap-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Bank Account Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bankAccount">Bank Account Number</Label>
                          <Input
                            id="bankAccount"
                            value={kycForm.bankAccount}
                            onChange={(e) => {
                              setKycForm(prev => ({ ...prev, bankAccount: e.target.value }));
                              clearError('bankAccount');
                              clearError('payment');
                            }}
                            className={errors.bankAccount ? 'border-red-300' : ''}
                          />
                          {errors.bankAccount && <p className="text-red-500 text-xs mt-1">{errors.bankAccount}</p>}
                        </div>
                        <div>
                          <Label htmlFor="ifscCode">IFSC Code</Label>
                          <Input
                            id="ifscCode"
                            placeholder="SBIN0001234"
                            value={kycForm.ifscCode}
                            onChange={(e) => {
                              setKycForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }));
                              clearError('ifscCode');
                              clearError('payment');
                            }}
                            className={errors.ifscCode ? 'border-red-300' : ''}
                          />
                          {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="text-center my-4">
                      <span className="text-sm text-[#6667AB] bg-gray-100 px-3 py-1 rounded-full">OR</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">UPI Details</h4>
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="user@paytm"
                          value={kycForm.upiId}
                          onChange={(e) => {
                            setKycForm(prev => ({ ...prev, upiId: e.target.value }));
                            clearError('upiId');
                            clearError('payment');
                          }}
                          className={errors.upiId ? 'border-red-300' : ''}
                        />
                        {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                      </div>
                    </div>

                    {errors.payment && <p className="text-red-500 text-xs">{errors.payment}</p>}
                  </div>
                </div>
              )}

              {currentKYCStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Final Verification</h3>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please review your information and complete the comprehensive KYC verification.
                        This process includes advanced security checks and may take a few minutes.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Verification Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div>Full Name: {kycForm.fullName}</div>
                          <div>Email: {kycForm.email}</div>
                          <div>Phone: {kycForm.phoneNumber}</div>
                          <div>PAN: {kycForm.panNumber}</div>
                          {kycForm.bankAccount && <div>Bank Account: ***{kycForm.bankAccount.slice(-4)}</div>}
                          {kycForm.upiId && <div>UPI ID: {kycForm.upiId}</div>}
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Verification Level</h4>
                        <div className="flex gap-2">
                          <Badge variant={verificationLevel === 'premium' ? 'default' : 'outline'}>
                            Premium Verification
                          </Badge>
                          <Badge variant="secondary">
                            Includes Digilocker + Face Liveness
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentKYCStep === 0}
                >
                  Previous
                </Button>

                {currentKYCStep < 3 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleComprehensiveKYC}
                    disabled={isVerifying}
                    className="bg-[#6667AB] hover:bg-[#5555AB]"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Complete KYC Verification
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {Object.entries(errors).map(([key, message]) => (
                        <div key={key}>{message}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Messages */}
              {successMessages.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {successMessages.map((message, index) => (
                        <div key={index}>{message}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-600" />
                Enhanced INR Withdrawal
              </CardTitle>
              <CardDescription>
                Instant USDC to INR conversion with verified banking details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnhancedWithdrawal} className="space-y-4">
                <div>
                  <Label htmlFor="amount">USDC Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={withdrawalForm.amount}
                    onChange={(e) => {
                      setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }));
                      clearError('amount');
                    }}
                    className={errors.amount ? 'border-red-300' : ''}
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                  {withdrawalForm.amount && (
                    <p className="text-sm text-gray-600 mt-1">
                      ≈ ₹{(parseFloat(withdrawalForm.amount) * exchangeRate).toLocaleString()} at current rate
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="verificationType">Withdrawal Method *</Label>
                  <select
                    id="verificationType"
                    value={withdrawalForm.verificationType}
                    onChange={(e) => setWithdrawalForm(prev => ({ ...prev, verificationType: e.target.value as 'bank' | 'upi' }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI Transfer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="beneficiaryName">Beneficiary Name *</Label>
                  <Input
                    id="beneficiaryName"
                    value={withdrawalForm.beneficiaryName}
                    onChange={(e) => {
                      setWithdrawalForm(prev => ({ ...prev, beneficiaryName: e.target.value }));
                      clearError('beneficiaryName');
                    }}
                    className={errors.beneficiaryName ? 'border-red-300' : ''}
                  />
                  {errors.beneficiaryName && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryName}</p>}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Current exchange rate: ₹{exchangeRate} per USDC. 
                    Enhanced withdrawals are processed instantly with verified accounts.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-[#6667AB] hover:bg-[#5555AB]"
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Withdrawal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Withdraw to INR
                    </>
                  )}
                </Button>

                {errors.withdrawal && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.withdrawal}</AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
