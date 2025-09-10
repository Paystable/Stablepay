
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
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
  Camera,
  CreditCard,
  Smartphone,
  Lock,
  Unlock,
  Eye,
  Upload,
  Star,
  Clock,
  Zap
} from 'lucide-react';

interface KYCFormData {
  personalInfo: {
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    address: string;
  };
  documents: {
    panNumber: string;
    aadhaarNumber: string;
    documentType: 'pan' | 'aadhaar' | 'passport' | 'driving_license';
    uploadedFiles: File[];
  };
  banking: {
    bankAccount: string;
    ifscCode: string;
    bankName: string;
    upiId: string;
    paymentMethod: 'bank' | 'upi' | 'both';
  };
  verification: {
    digilockerConsent: boolean;
    faceLivenessConsent: boolean;
    termsAccepted: boolean;
  };
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  confidence?: number;
  isRequired: boolean;
  estimatedTime: string;
}

const initialFormData: KYCFormData = {
  personalInfo: {
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  },
  documents: {
    panNumber: '',
    aadhaarNumber: '',
    documentType: 'pan',
    uploadedFiles: []
  },
  banking: {
    bankAccount: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
    paymentMethod: 'bank'
  },
  verification: {
    digilockerConsent: false,
    faceLivenessConsent: false,
    termsAccepted: false
  }
};

export default function KYCVerificationSuite() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<KYCFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'in_progress' | 'verified' | 'rejected'>('not_started');
  const [verificationLevel, setVerificationLevel] = useState<'basic' | 'enhanced' | 'premium'>('premium');

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Basic identity details',
      icon: User,
      status: 'pending',
      isRequired: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'document_verification',
      title: 'Document Verification',
      description: 'PAN & Aadhaar verification',
      icon: FileText,
      status: 'pending',
      isRequired: true,
      estimatedTime: '3 minutes'
    },
    {
      id: 'digilocker_verification',
      title: 'Digilocker Verification',
      description: 'Government document authentication',
      icon: Shield,
      status: 'pending',
      isRequired: true,
      estimatedTime: '5 minutes'
    },
    {
      id: 'face_liveness',
      title: 'Face Liveness Check',
      description: 'Live selfie verification',
      icon: Camera,
      status: 'pending',
      isRequired: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'banking_verification',
      title: 'Banking Details',
      description: 'Bank account & UPI verification',
      icon: Building2,
      status: 'pending',
      isRequired: true,
      estimatedTime: '3 minutes'
    }
  ]);

  const stepTitles = [
    'Personal Information',
    'Document Upload',
    'Banking Details',
    'Identity Verification',
    'Final Review'
  ];

  const getVerificationLevelInfo = (level: 'basic' | 'enhanced' | 'premium') => {
    switch (level) {
      case 'basic':
        return {
          title: 'Basic Verification',
          description: 'Essential verification for basic features',
          color: 'bg-blue-100 text-blue-800',
          features: ['PAN Verification', 'Basic Bank Details', 'Email Verification'],
          limits: '₹25,000/month withdrawal limit'
        };
      case 'enhanced':
        return {
          title: 'Enhanced Verification',
          description: 'Advanced verification for higher limits',
          color: 'bg-orange-100 text-orange-800',
          features: ['Advanced PAN Check', 'Bank Account Verification', 'Phone Verification'],
          limits: '₹1,00,000/month withdrawal limit'
        };
      case 'premium':
        return {
          title: 'Premium Verification',
          description: 'Complete verification for unlimited access',
          color: 'bg-green-100 text-green-800',
          features: ['Digilocker Integration', 'Face Liveness', 'Comprehensive Checks'],
          limits: 'Unlimited withdrawals'
        };
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.personalInfo.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.personalInfo.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.personalInfo.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.personalInfo.phoneNumber)) {
          newErrors.phoneNumber = 'Invalid phone number format';
        }
        break;

      case 1: // Documents
        if (!formData.documents.panNumber.trim()) {
          newErrors.panNumber = 'PAN number is required';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.documents.panNumber)) {
          newErrors.panNumber = 'Invalid PAN format (ABCDE1234F)';
        }
        break;

      case 2: // Banking
        if (formData.banking.paymentMethod === 'bank' || formData.banking.paymentMethod === 'both') {
          if (!formData.banking.bankAccount.trim()) {
            newErrors.bankAccount = 'Bank account number is required';
          }
          if (!formData.banking.ifscCode.trim()) {
            newErrors.ifscCode = 'IFSC code is required';
          } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.banking.ifscCode)) {
            newErrors.ifscCode = 'Invalid IFSC code format';
          }
        }
        if (formData.banking.paymentMethod === 'upi' || formData.banking.paymentMethod === 'both') {
          if (!formData.banking.upiId.trim()) {
            newErrors.upiId = 'UPI ID is required';
          } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.banking.upiId)) {
            newErrors.upiId = 'Invalid UPI ID format';
          }
        }
        break;

      case 3: // Verification
        if (!formData.verification.digilockerConsent) {
          newErrors.digilockerConsent = 'Digilocker consent is required';
        }
        if (!formData.verification.faceLivenessConsent) {
          newErrors.faceLivenessConsent = 'Face liveness consent is required';
        }
        break;

      case 4: // Final Review
        if (!formData.verification.termsAccepted) {
          newErrors.termsAccepted = 'Terms and conditions must be accepted';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (section: keyof KYCFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, stepTitles.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const initiateDigilockerVerification = async () => {
    try {
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'digilocker_verification' 
          ? { ...step, status: 'in_progress' }
          : step
      ));

      const response = await fetch('/api/kyc/digilocker/aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address })
      });

      const result = await response.json();

      if (result.success) {
        window.open(result.consentUrl, '_blank');
        setVerificationSteps(prev => prev.map(step => 
          step.id === 'digilocker_verification' 
            ? { ...step, status: 'completed', confidence: 95 }
            : step
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'digilocker_verification' 
          ? { ...step, status: 'failed' }
          : step
      ));
    }
  };

  const initiateFaceLiveness = async () => {
    try {
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'face_liveness' 
          ? { ...step, status: 'in_progress' }
          : step
      ));

      const response = await fetch('/api/kyc/face/liveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, verificationId: 'temp_id' })
      });

      const result = await response.json();

      if (result.success) {
        window.open(result.liveness_url, '_blank');
        setVerificationSteps(prev => prev.map(step => 
          step.id === 'face_liveness' 
            ? { ...step, status: 'completed', confidence: 98 }
            : step
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'face_liveness' 
          ? { ...step, status: 'failed' }
          : step
      ));
    }
  };

  const submitKYCVerification = async () => {
    if (!validateStep(4)) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/kyc/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          fullName: formData.personalInfo.fullName,
          email: formData.personalInfo.email,
          phone: formData.personalInfo.phoneNumber,
          panNumber: formData.documents.panNumber,
          bankAccount: formData.banking.bankAccount || undefined,
          ifscCode: formData.banking.ifscCode || undefined,
          upiId: formData.banking.upiId || undefined,
          verificationLevel
        })
      });

      const result = await response.json();

      if (result.success && result.status === 'verified') {
        setKycStatus('verified');
        setVerificationSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
      } else {
        setKycStatus('rejected');
      }
    } catch (error) {
      setKycStatus('rejected');
    } finally {
      setIsVerifying(false);
    }
  };

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / verificationSteps.length) * 100;
  const levelInfo = getVerificationLevelInfo(verificationLevel);

  if (!address) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-2 border-[#6667AB]/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Connect Your Wallet</CardTitle>
            <CardDescription className="text-lg">
              Please connect your wallet to begin the KYC verification process
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (kycStatus === 'verified') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-800">KYC Verification Complete!</CardTitle>
            <CardDescription className="text-lg text-green-700">
              Your account has been successfully verified. You can now access all StablePay features.
            </CardDescription>
            <Badge className="mx-auto mt-4 bg-green-600">
              {levelInfo.title} - {levelInfo.limits}
            </Badge>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#6667AB]/20 bg-gradient-to-r from-[#6667AB]/5 to-[#8B5CF6]/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">StablePay KYC Verification</CardTitle>
                <CardDescription className="text-lg">
                  Complete your identity verification to unlock unlimited crypto-to-INR transfers
                </CardDescription>
              </div>
            </div>
            <Badge className={levelInfo.color}>
              {levelInfo.title}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Verification Level Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#6667AB]" />
            Choose Your Verification Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {(['basic', 'enhanced', 'premium'] as const).map((level) => {
              const info = getVerificationLevelInfo(level);
              return (
                <Card 
                  key={level}
                  className={`cursor-pointer transition-all ${
                    verificationLevel === level 
                      ? 'border-[#6667AB] bg-[#6667AB]/5' 
                      : 'border-gray-200 hover:border-[#6667AB]/50'
                  }`}
                  onClick={() => setVerificationLevel(level)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{info.title}</CardTitle>
                      {level === 'premium' && <Badge className="bg-[#6667AB]">Recommended</Badge>}
                    </div>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm font-medium text-[#6667AB]">{info.limits}</div>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {info.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Verification Progress</span>
              <span className="text-sm text-gray-600">{completedSteps} of {verificationSteps.length} completed</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {verificationSteps.map((step) => {
                const IconComponent = step.icon as React.ComponentType<{ className?: string }>;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      step.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{step.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedTime}
                      </div>
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

      {/* Main Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{stepTitles[currentStep]}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {stepTitles.length}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {Math.round(((currentStep + 1) / stepTitles.length) * 100)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Content */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.personalInfo.fullName}
                    onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-300' : ''}
                    placeholder="Enter your full legal name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                    className={errors.email ? 'border-red-300' : ''}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.personalInfo.phoneNumber}
                    onChange={(e) => updateFormData('personalInfo', 'phoneNumber', e.target.value)}
                    className={errors.phoneNumber ? 'border-red-300' : ''}
                    placeholder="9876543210"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.personalInfo.address}
                  onChange={(e) => updateFormData('personalInfo', 'address', e.target.value)}
                  placeholder="Enter your complete address"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.documents.panNumber}
                    onChange={(e) => updateFormData('documents', 'panNumber', e.target.value.toUpperCase())}
                    className={errors.panNumber ? 'border-red-300' : ''}
                    placeholder="ABCDE1234F"
                  />
                  {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    value={formData.documents.aadhaarNumber}
                    onChange={(e) => updateFormData('documents', 'aadhaarNumber', e.target.value)}
                    placeholder="1234 5678 9012"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                <p className="text-gray-600 mb-4">
                  Upload clear images of your PAN card and Aadhaar card
                </p>
                <Button variant="outline" className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB] hover:text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported: JPG, PNG, PDF (Max 5MB each)
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Preferred Payment Method *</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {[
                    { value: 'bank', label: 'Bank Account', icon: Building2 },
                    { value: 'upi', label: 'UPI Only', icon: Smartphone },
                    { value: 'both', label: 'Both Methods', icon: CreditCard }
                  ].map(({ value, label, icon: Icon }) => (
                    <Card 
                      key={value}
                      className={`cursor-pointer transition-all ${
                        formData.banking.paymentMethod === value 
                          ? 'border-[#6667AB] bg-[#6667AB]/5' 
                          : 'border-gray-200 hover:border-[#6667AB]/50'
                      }`}
                      onClick={() => updateFormData('banking', 'paymentMethod', value)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto mb-2 text-[#6667AB]" />
                        <div className="text-sm font-medium">{label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {(formData.banking.paymentMethod === 'bank' || formData.banking.paymentMethod === 'both') && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">Bank Account Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankAccount">Account Number *</Label>
                      <Input
                        id="bankAccount"
                        value={formData.banking.bankAccount}
                        onChange={(e) => updateFormData('banking', 'bankAccount', e.target.value)}
                        className={errors.bankAccount ? 'border-red-300' : ''}
                        placeholder="123456789012"
                      />
                      {errors.bankAccount && <p className="text-red-500 text-sm mt-1">{errors.bankAccount}</p>}
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        value={formData.banking.ifscCode}
                        onChange={(e) => updateFormData('banking', 'ifscCode', e.target.value.toUpperCase())}
                        className={errors.ifscCode ? 'border-red-300' : ''}
                        placeholder="SBIN0001234"
                      />
                      {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.banking.bankName}
                      onChange={(e) => updateFormData('banking', 'bankName', e.target.value)}
                      placeholder="State Bank of India"
                    />
                  </div>
                </div>
              )}

              {(formData.banking.paymentMethod === 'upi' || formData.banking.paymentMethod === 'both') && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">UPI Details</h3>
                  <div>
                    <Label htmlFor="upiId">UPI ID *</Label>
                    <Input
                      id="upiId"
                      value={formData.banking.upiId}
                      onChange={(e) => updateFormData('banking', 'upiId', e.target.value)}
                      className={errors.upiId ? 'border-red-300' : ''}
                      placeholder="username@paytm"
                    />
                    {errors.upiId && <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  The following verifications will be performed to ensure the highest level of security.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-8 w-8 text-[#6667AB]" />
                      <div>
                        <h3 className="font-medium">Digilocker Verification</h3>
                        <p className="text-sm text-gray-600">Secure document verification via Government of India</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="digilockerConsent"
                        checked={formData.verification.digilockerConsent}
                        onChange={(e) => updateFormData('verification', 'digilockerConsent', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Button 
                        onClick={initiateDigilockerVerification}
                        disabled={!formData.verification.digilockerConsent}
                        className="bg-[#6667AB] hover:bg-[#5555AB]"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Start Verification
                      </Button>
                    </div>
                  </div>
                  {errors.digilockerConsent && <p className="text-red-500 text-sm mt-2">{errors.digilockerConsent}</p>}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-8 w-8 text-[#6667AB]" />
                      <div>
                        <h3 className="font-medium">Face Liveness Detection</h3>
                        <p className="text-sm text-gray-600">Live selfie verification for enhanced security</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="faceLivenessConsent"
                        checked={formData.verification.faceLivenessConsent}
                        onChange={(e) => updateFormData('verification', 'faceLivenessConsent', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Button 
                        onClick={initiateFaceLiveness}
                        disabled={!formData.verification.faceLivenessConsent}
                        className="bg-[#6667AB] hover:bg-[#5555AB]"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Start Liveness Check
                      </Button>
                    </div>
                  </div>
                  {errors.faceLivenessConsent && <p className="text-red-500 text-sm mt-2">{errors.faceLivenessConsent}</p>}
                </Card>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Please review your information before submitting for verification.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {formData.personalInfo.fullName}</div>
                    <div><strong>Email:</strong> {formData.personalInfo.email}</div>
                    <div><strong>Phone:</strong> {formData.personalInfo.phoneNumber}</div>
                    <div><strong>PAN:</strong> {formData.documents.panNumber}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-3">Banking Details</h3>
                  <div className="space-y-2 text-sm">
                    {formData.banking.bankAccount && (
                      <div><strong>Bank Account:</strong> ***{formData.banking.bankAccount.slice(-4)}</div>
                    )}
                    {formData.banking.ifscCode && (
                      <div><strong>IFSC:</strong> {formData.banking.ifscCode}</div>
                    )}
                    {formData.banking.upiId && (
                      <div><strong>UPI ID:</strong> {formData.banking.upiId}</div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={formData.verification.termsAccepted}
                  onChange={(e) => updateFormData('verification', 'termsAccepted', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="termsAccepted" className="text-sm">
                  I agree to the <a href="#" className="text-[#6667AB] underline">Terms and Conditions</a> and <a href="#" className="text-[#6667AB] underline">Privacy Policy</a>
                </label>
              </div>
              {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < stepTitles.length - 1 ? (
              <Button 
                onClick={handleNext}
                className="bg-[#6667AB] hover:bg-[#5555AB]"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={submitKYCVerification}
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
                    <Zap className="h-4 w-4 mr-2" />
                    Submit for Verification
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors:
            <ul className="list-disc list-inside mt-2">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
