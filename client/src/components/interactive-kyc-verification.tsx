
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { ChevronRight, ChevronLeft, Shield, User, FileText, CreditCard, CheckCircle } from 'lucide-react';

interface KYCStep {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const kycSteps: KYCStep[] = [
  {
    id: 1,
    title: 'Personal Info',
    icon: <User className="w-5 h-5" />,
    description: 'Basic personal information'
  },
  {
    id: 2,
    title: 'Documents',
    icon: <FileText className="w-5 h-5" />,
    description: 'Identity verification documents'
  },
  {
    id: 3,
    title: 'Banking',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Bank account verification'
  },
  {
    id: 4,
    title: 'Verification',
    icon: <CheckCircle className="w-5 h-5" />,
    description: 'Complete verification process'
  }
];

export default function InteractiveKYCVerification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    documents: {
      idType: '',
      idNumber: '',
      documents: []
    },
    banking: {
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    }
  });

  const progressPercentage = (currentStep / kycSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < kycSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const updateFormData = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.personalInfo.fullName}
                onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => updateFormData('personalInfo', 'email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.personalInfo.phone}
                onChange={(e) => updateFormData('personalInfo', 'phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.personalInfo.address}
                onChange={(e) => updateFormData('personalInfo', 'address', e.target.value)}
                placeholder="Enter your address"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="idType">ID Type</Label>
              <select
                id="idType"
                className="w-full p-2 border rounded-md"
                value={formData.documents.idType}
                onChange={(e) => updateFormData('documents', 'idType', e.target.value)}
              >
                <option value="">Select ID Type</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>
            <div>
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={formData.documents.idNumber}
                onChange={(e) => updateFormData('documents', 'idNumber', e.target.value)}
                placeholder="Enter ID number"
              />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Upload your documents</p>
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.banking.bankName}
                onChange={(e) => updateFormData('banking', 'bankName', e.target.value)}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.banking.accountNumber}
                onChange={(e) => updateFormData('banking', 'accountNumber', e.target.value)}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.banking.ifscCode}
                onChange={(e) => updateFormData('banking', 'ifscCode', e.target.value)}
                placeholder="Enter IFSC code"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-lg font-semibold">Review & Submit</h3>
            <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
              <p><strong>Name:</strong> {formData.personalInfo.fullName}</p>
              <p><strong>Email:</strong> {formData.personalInfo.email}</p>
              <p><strong>Phone:</strong> {formData.personalInfo.phone}</p>
              <p><strong>ID Type:</strong> {formData.documents.idType}</p>
              <p><strong>Bank:</strong> {formData.banking.bankName}</p>
            </div>
            <Button className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90">
              Submit Verification
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#6667AB] rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete KYC Verification</h2>
        <p className="text-gray-600">Secure, fast, and compliant verification process to enable seamless INR withdrawals</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-[#6667AB]">{currentStep} of {kycSteps.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between items-center mb-8">
        {kycSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepClick(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep >= step.id
                  ? 'bg-[#6667AB] border-[#6667AB] text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {step.icon}
            </button>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-[#6667AB]' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < kycSteps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {kycSteps[currentStep - 1]?.icon}
            {kycSteps[currentStep - 1]?.title}
          </CardTitle>
          <p className="text-gray-600">{kycSteps[currentStep - 1]?.description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === kycSteps.length}
          className="flex items-center gap-2 bg-[#6667AB] hover:bg-[#6667AB]/90"
        >
          {currentStep === kycSteps.length ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
