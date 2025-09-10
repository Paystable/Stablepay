import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  Shield, 
  User, 
  MapPin, 
  Building, 
  CheckCircle, 
  AlertTriangle,
  Info
} from "lucide-react";

interface TravelRuleComplianceProps {
  userAddress: string;
  onComplete: (data: OriginatorInfo) => void;
  onSkip?: () => void;
}

interface OriginatorInfo {
  fullName: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth: string;
  nationalId: string;
  idType: 'passport' | 'driving_license' | 'national_id' | 'aadhaar';
  accountNumber?: string;
  bankName?: string;
  swiftCode?: string;
  sourceOfFunds?: string;
  purposeOfTransaction?: string;
  ownershipDetails?: string;
  relationshipToBeneficiary?: string;
  additionalVerificationMethod?: string;
  riskCategory?: string;
}

const COUNTRIES = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'SG', label: 'Singapore' },
  // Add more countries as needed
];

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'national_id', label: 'National ID Card' }
];

const SOURCE_OF_FUNDS = [
  { value: 'salary', label: 'Salary' },
  { value: 'business_income', label: 'Business Income' },
  { value: 'investments', label: 'Investments' },
  { value: 'savings', label: 'Savings' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'other', label: 'Other' },
];

const TRANSACTION_PURPOSES = [
  { value: 'purchase', label: 'Purchase of Goods/Services' },
  { value: 'investment', label: 'Investment' },
  { value: 'remittance', label: 'Remittance' },
  { value: 'loan_repayment', label: 'Loan Repayment' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' },
];

export default function TravelRuleCompliance({ userAddress, onComplete, onSkip }: TravelRuleComplianceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OriginatorInfo>({
    fullName: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN'
    },
    dateOfBirth: '',
    nationalId: '',
    idType: 'aadhaar',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    sourceOfFunds: '',
    purposeOfTransaction: '',
    ownershipDetails: '',
    relationshipToBeneficiary: '',
    additionalVerificationMethod: '',
    riskCategory: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assume a transaction amount to determine compliance level. This would typically come from context or props.
  const transactionAmount = 1500; // Example: €1,500
  const isBasicLevel = transactionAmount <= 1000;
  const isEnhancedLevel = !isBasicLevel;
  const isThirdPartyTransaction = false; // Placeholder: Determine based on transaction details

  const totalSteps = isEnhancedLevel ? (isThirdPartyTransaction ? 5 : 4) : 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.nationalId.trim()) newErrors.nationalId = 'ID document number is required';
      if (!formData.idType) newErrors.idType = 'ID document type is required';
    }

    if (step === 2) {
      if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
      if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
      if (!formData.address.state.trim()) newErrors['address.state'] = 'State/Province is required';
      if (!formData.address.postalCode.trim()) newErrors['address.postalCode'] = 'Postal code is required';
      if (!formData.address.country) newErrors['address.country'] = 'Country is required';
    }

    if (step === 3 && isEnhancedLevel) {
      if (!formData.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required for enhanced verification';
      if (!formData.bankName?.trim()) newErrors.bankName = 'Bank name is required for enhanced verification';
      // Add validation for sourceOfFunds and purposeOfTransaction if they are mandatory for enhanced level
      if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
      if (!formData.purposeOfTransaction) newErrors.purposeOfTransaction = 'Purpose of transaction is required';
    }

    if (step === 4 && isEnhancedLevel && isThirdPartyTransaction) {
      if (!formData.relationshipToBeneficiary?.trim()) newErrors.relationshipToBeneficiary = 'Relationship to beneficiary is required';
      if (!formData.additionalVerificationMethod) newErrors.additionalVerificationMethod = 'Additional verification method is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission logic
    setIsSubmitting(true);
    try {
      console.log('Submitting travel rule data:', formData);
      onComplete(formData);
    } catch (error) {
      console.error('Error submitting travel rule data:', error);
      setErrors({ submit: 'Failed to submit information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (path: string, value: string) => {
    setFormData(prev => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else {
        // Deep update for nested objects like address
        const nestedKey = keys[0] as keyof OriginatorInfo;
        const subKey = keys[1] as keyof typeof prev[typeof nestedKey];
        return {
          ...prev,
          [nestedKey]: {
            ...(prev[nestedKey] as object), // Ensure it's treated as an object
            [subKey]: value
          }
        };
      }
    });
    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white shadow-2xl border border-[#6667AB]/20">
        <CardHeader className="text-center border-b border-[#6667AB]/10">
          <div className="w-16 h-16 bg-[#6667AB] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            Travel Rule Compliance
          </CardTitle>
          <p className="text-[#6667AB] mt-2">
            Complete your originator information for regulatory compliance
          </p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Transaction Level Indicator */}
          <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[#6667AB]" />
              <span className="font-semibold text-gray-900">
                Compliance Level: {isBasicLevel ? 'Basic (≤ €1,000)' : 'Enhanced (> €1,000)'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {isBasicLevel 
                ? 'Basic information required for transactions up to €1,000'
                : 'Enhanced verification required for transactions above €1,000'
              }
            </p>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <Alert className="border-[#6667AB]/20 bg-[#6667AB]/5">
                <Info className="h-4 w-4 text-[#6667AB]" />
                <AlertDescription className="text-[#6667AB]">
                  <strong>Personal Information:</strong> Provide your basic identification details as required by Travel Rule regulations.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-black">
                    Full Legal Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Enter your full name as per official documents"
                    className={`mt-2 ${errors.fullName ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-black">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className={`mt-2 ${errors.dateOfBirth ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="idType" className="text-sm font-medium text-black">
                    ID Document Type *
                  </Label>
                  <Select value={formData.idType} onValueChange={(value) => updateFormData('idType', value)}>
                    <SelectTrigger className={`mt-2 ${errors.idType ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ID_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idType && (
                    <p className="text-red-500 text-xs mt-1">{errors.idType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationalId" className="text-sm font-medium text-black">
                    ID Document Number *
                  </Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => updateFormData('nationalId', e.target.value)}
                    placeholder="Enter your ID document number"
                    className={`mt-2 ${errors.nationalId ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.nationalId && (
                    <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Alert className="border-[#6667AB]/20 bg-[#6667AB]/5">
                <MapPin className="h-4 w-4 text-[#6667AB]" />
                <AlertDescription className="text-[#6667AB]">
                  <strong>Address Information:</strong> Provide your complete residential address for verification.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="street" className="text-sm font-medium text-black">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    placeholder="Enter your street address"
                    className={`mt-2 ${errors['address.street'] ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors['address.street'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['address.street']}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-black">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateFormData('address.city', e.target.value)}
                      placeholder="City"
                      className={`mt-2 ${errors['address.city'] ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                    />
                    {errors['address.city'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-black">
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => updateFormData('address.state', e.target.value)}
                      placeholder="State/Province"
                      className={`mt-2 ${errors['address.state'] ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                    />
                    {errors['address.state'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['address.state']}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-sm font-medium text-black">
                      Postal Code *
                    </Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => updateFormData('address.postalCode', e.target.value)}
                      placeholder="Postal Code"
                      className={`mt-2 ${errors['address.postalCode'] ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                    />
                    {errors['address.postalCode'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['address.postalCode']}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-black">
                      Country *
                    </Label>
                    <Select value={formData.address.country} onValueChange={(value) => updateFormData('address.country', value)}>
                      <SelectTrigger className={`mt-2 ${errors['address.country'] ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['address.country'] && (
                      <p className="text-red-500 text-xs mt-1">{errors['address.country']}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && isEnhancedLevel && (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <Building className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Financial Information:</strong> Enhanced verification required for transactions above €1,000.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="accountNumber" className="text-sm font-medium text-black">
                    Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={(e) => updateFormData('accountNumber', e.target.value)}
                    placeholder="Enter your bank account number"
                    className={`mt-2 ${errors.accountNumber ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium text-black">
                    Bank Name *
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ''}
                    onChange={(e) => updateFormData('bankName', e.target.value)}
                    placeholder="Enter your bank name"
                    className={`mt-2 ${errors.bankName ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="swiftCode" className="text-sm font-medium text-black">
                    SWIFT/BIC Code (Optional)
                  </Label>
                  <Input
                    id="swiftCode"
                    value={formData.swiftCode || ''}
                    onChange={(e) => updateFormData('swiftCode', e.target.value)}
                    placeholder="Enter SWIFT/BIC code for international transfers"
                    className="mt-2 border-[#6667AB]/30 focus:border-[#6667AB]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && isEnhancedLevel && (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Source of Funds & Purpose:</strong> Required for risk assessment and compliance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="sourceOfFunds" className="text-sm font-medium text-black">
                    Source of Funds *
                  </Label>
                  <Select value={formData.sourceOfFunds || ''} onValueChange={(value) => updateFormData('sourceOfFunds', value)}>
                    <SelectTrigger className={`mt-2 ${errors.sourceOfFunds ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}>
                      <SelectValue placeholder="Select source of funds" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_OF_FUNDS.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sourceOfFunds && (
                    <p className="text-red-500 text-xs mt-1">{errors.sourceOfFunds}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="purposeOfTransaction" className="text-sm font-medium text-black">
                    Purpose of Transaction *
                  </Label>
                  <Select value={formData.purposeOfTransaction || ''} onValueChange={(value) => updateFormData('purposeOfTransaction', value)}>
                    <SelectTrigger className={`mt-2 ${errors.purposeOfTransaction ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}>
                      <SelectValue placeholder="Select transaction purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_PURPOSES.map((purpose) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.purposeOfTransaction && (
                    <p className="text-red-500 text-xs mt-1">{errors.purposeOfTransaction}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ownershipDetails" className="text-sm font-medium text-black">
                    Ownership/Control Details
                  </Label>
                  <Input
                    id="ownershipDetails"
                    value={formData.ownershipDetails || ''}
                    onChange={(e) => updateFormData('ownershipDetails', e.target.value)}
                    placeholder="Describe account ownership or controlling party (if applicable)"
                    className="mt-2 border-[#6667AB]/30 focus:border-[#6667AB]"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && isThirdPartyTransaction && isEnhancedLevel && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Enhanced Risk Verification:</strong> Additional verification required for 3rd party transactions above €1,000.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="relationshipToBeneficiary" className="text-sm font-medium text-black">
                    Relationship to Beneficiary *
                  </Label>
                  <Input
                    id="relationshipToBeneficiary"
                    value={formData.relationshipToBeneficiary || ''}
                    onChange={(e) => updateFormData('relationshipToBeneficiary', e.target.value)}
                    placeholder="e.g., Family member, Business partner, Employee"
                    className={`mt-2 ${errors.relationshipToBeneficiary ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}
                  />
                  {errors.relationshipToBeneficiary && (
                    <p className="text-red-500 text-xs mt-1">{errors.relationshipToBeneficiary}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalVerificationMethod" className="text-sm font-medium text-black">
                    Additional Verification Method *
                  </Label>
                  <Select value={formData.additionalVerificationMethod || ''} onValueChange={(value) => updateFormData('additionalVerificationMethod', value)}>
                    <SelectTrigger className={`mt-2 ${errors.additionalVerificationMethod ? 'border-red-500' : 'border-[#6667AB]/30'} focus:border-[#6667AB]`}>
                      <SelectValue placeholder="Select verification method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document_verification">Additional Document Verification</SelectItem>
                      <SelectItem value="video_call">Video Call Verification</SelectItem>
                      <SelectItem value="biometric_verification">Biometric Verification</SelectItem>
                      <SelectItem value="third_party_verification">Third-party Database Verification</SelectItem>
                      <SelectItem value="manual_review">Manual Review Process</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.additionalVerificationMethod && (
                    <p className="text-red-500 text-xs mt-1">{errors.additionalVerificationMethod}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="riskCategory" className="text-sm font-medium text-black">
                    Risk Category Assessment
                  </Label>
                  <Select value={formData.riskCategory || 'medium'} onValueChange={(value) => updateFormData('riskCategory', value)}>
                    <SelectTrigger className="mt-2 border-[#6667AB]/30 focus:border-[#6667AB]">
                      <SelectValue placeholder="Select risk category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Basic verification completion view */}
          {currentStep === 3 && !isEnhancedLevel && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Verification Complete!</h3>
              <p className="text-gray-600 text-center max-w-md">
                Your basic information has been successfully verified. You can proceed with your transaction.
              </p>
            </div>
          )}

          {errors.submit && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#6667AB]/10">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                >
                  Previous
                </Button>
              )}
              {onSkip && currentStep === 1 && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </Button>
              )}
            </div>

            <div>
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#6667AB] hover:bg-[#6667AB]/90 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#6667AB] hover:bg-[#6667AB]/90 text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Compliance'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}