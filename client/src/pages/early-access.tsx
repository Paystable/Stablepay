import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Star,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Target,
  Globe,
  Award,
  Zap,
  Coins,
  Clock,
  BarChart3,
  PieChart,
  Gift,
  Sparkles,
  Rocket,
  Heart,
  Building2,
  GraduationCap,
  Briefcase
} from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  monthlyRemittance: number;
  currentService: string;
  investmentAmount: number;
  lockPeriod: string;
  riskTolerance: string;
  primaryGoal: string;
  referralSource: string;
}

interface CalculationResults {
  annualSavings: number;
  monthlySavings: number;
  totalSavings5Years: number;
  projectedYield: number;
  annualYield: number;
  totalYield5Years: number;
  combinedBenefit: number;
}

export default function EarlyAccess() {
  const [activeForm, setActiveForm] = useState<'savings' | 'investment'>('savings');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    monthlyRemittance: 2000,
    currentService: 'wise',
    investmentAmount: 5000,
    lockPeriod: '12-months',
    riskTolerance: 'moderate',
    primaryGoal: 'both',
    referralSource: 'social-media'
  });
  const [calculations, setCalculations] = useState<CalculationResults>({
    annualSavings: 0,
    monthlySavings: 0,
    totalSavings5Years: 0,
    projectedYield: 0,
    annualYield: 0,
    totalYield5Years: 0,
    combinedBenefit: 0
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  // Service fee rates (percentage)
  const serviceFees: Record<string, number> = {
    'western-union': 4.5,
    'remitly': 3.8,
    'wise': 2.5,
    'moneygram': 4.2,
    'xoom': 3.5,
    'other': 3.0
  };

  // APY rates by lock period
  const apyRates: Record<string, number> = {
    '15-days': 7,
    '1-month': 8,
    '3-months': 9,
    '6-months': 10.5,
    '12-months': 14
  };

  // Calculate all benefits
  const calculateBenefits = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const monthlyAmount = formData.monthlyRemittance;
      const currentFeeRate = serviceFees[formData.currentService] || 3.0;
      const currentMonthlyFees = (monthlyAmount * currentFeeRate) / 100;
      
      // Remittance savings calculations
      const monthlySavings = currentMonthlyFees; // Zero fees with Stable Pay
      const annualSavings = monthlySavings * 12;
      const totalSavings5Years = annualSavings * 5;
      
      // Investment yield calculations
      const apyRate = apyRates[formData.lockPeriod] || 14;
      const investmentAmount = formData.investmentAmount;
      const annualYield = (investmentAmount * apyRate) / 100;
      const totalYield5Years = annualYield * 5;
      
      // Combined benefits
      const combinedBenefit = totalSavings5Years + totalYield5Years;
      
      setCalculations({
        annualSavings,
        monthlySavings,
        totalSavings5Years,
        projectedYield: apyRate,
        annualYield,
        totalYield5Years,
        combinedBenefit
      });
      
      setIsCalculating(false);
    }, 800);
  };

  // Recalculate when relevant inputs change
  useEffect(() => {
    calculateBenefits();
  }, [formData.monthlyRemittance, formData.currentService, formData.investmentAmount, formData.lockPeriod]);


  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isConnected) {
        // Connect wallet first
        const connector = connectors[0]; // Use first available connector (usually MetaMask)
        await connect({ connector });
        
        // Wait a moment for connection to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Submit form data to MongoDB via API
      const submissionData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        formType: activeForm,
        monthlyRemittance: formData.monthlyRemittance,
        currentService: formData.currentService,
        investmentAmount: formData.investmentAmount,
        lockPeriod: formData.lockPeriod,
        riskTolerance: formData.riskTolerance,
        primaryGoal: formData.primaryGoal,
        referralSource: formData.referralSource,
        walletAddress: address,
        calculations: calculations
      };

      const response = await fetch('/api/early-access/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit early access request');
      }

      // Show success dialog with results
      setShowSuccessDialog(true);
      
      toast({
        title: "🎉 Early Access Request Submitted!",
        description: `Welcome ${formData.fullName}! Your wallet is connected and form submitted successfully!`,
      });

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or connect your wallet manually.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const formTabs = [
    { 
      id: 'savings', 
      label: '💰 Savings Calculator', 
      icon: Calculator, 
      description: 'See how much you\'ll save',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'investment', 
      label: '📈 Investment Profile', 
      icon: TrendingUp, 
      description: 'Build your yield strategy',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Section */}
      <section className="pt-8 pb-6 brand-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-[#6667AB] text-white border-none px-6 py-3 text-base font-semibold mb-6 rounded-full">
              <Star className="w-5 h-5 mr-2" />
              Early Access Program
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 no-blur">
              Join the{" "}
              <span className="brand-text">Remittance Revolution</span>
            </h1>
            <p className="text-xl sm:text-2xl brand-text max-w-4xl mx-auto mb-8 no-blur">
              Be among the first to experience zero-fee remittances and up to 14% APY returns. 
              Join 1,000+ NRIs already saving thousands annually.
            </p>

          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Form Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {formTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeForm === tab.id ? "default" : "outline"}
                className={`flex-1 h-auto p-6 ${
                  activeForm === tab.id
                    ? "bg-[#6667AB] text-white hover:bg-[#6667AB]/90"
                    : "border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                }`}
                onClick={() => setActiveForm(tab.id as any)}
              >
                <div className="text-center">
                  <tab.icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-80 mt-1">{tab.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Form Content */}
          <Card className="brand-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-black no-blur flex items-center justify-center gap-3">
                {activeForm === 'savings' && (
                  <>
                    <Calculator className="w-8 h-8 text-green-600" />
                    Calculate Your Remittance Savings
                  </>
                )}
                {activeForm === 'investment' && (
                  <>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    Build Your Investment Profile
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Savings Calculator Form */}
                {activeForm === 'savings' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="monthlyRemittance" className="text-black font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Monthly Remittance Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold text-lg">$</span>
                          <Input
                            id="monthlyRemittance"
                            type="number"
                            placeholder="2000"
                            value={formData.monthlyRemittance}
                            onChange={(e) => handleInputChange('monthlyRemittance', Number(e.target.value))}
                            className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] pl-8 text-lg font-semibold"
                          />
                        </div>
                        <div className="text-sm text-[#6667AB]">
                          💡 Average NRI sends $2,000-5,000 monthly
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="currentService" className="text-black font-semibold flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Current Service Used
                        </Label>
                        <Select value={formData.currentService} onValueChange={(value) => handleInputChange('currentService', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 bg-white text-black">
                            <SelectValue placeholder="Select your current service" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="western-union" className="text-black hover:bg-[#6667AB]/10">🏢 Western Union (4.5% fees)</SelectItem>
                            <SelectItem value="remitly" className="text-black hover:bg-[#6667AB]/10">🌍 Remitly (3.8% fees)</SelectItem>
                            <SelectItem value="wise" className="text-black hover:bg-[#6667AB]/10">⚡ Wise (2.5% fees)</SelectItem>
                            <SelectItem value="moneygram" className="text-black hover:bg-[#6667AB]/10">💸 MoneyGram (4.2% fees)</SelectItem>
                            <SelectItem value="xoom" className="text-black hover:bg-[#6667AB]/10">🚀 Xoom (3.5% fees)</SelectItem>
                            <SelectItem value="other" className="text-black hover:bg-[#6667AB]/10">🔧 Other (3.0% avg fees)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-[#6667AB]">
                          Current fees: {serviceFees[formData.currentService]}% per transaction
                        </div>
                      </div>
                    </div>

                    {/* Real-time Savings Display */}
                    {!isCalculating && calculations.annualSavings > 0 && (
                      <div className="space-y-4">
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <Sparkles className="w-6 h-6 text-green-600" />
                                <span className="text-lg font-semibold text-green-800">Your Potential Savings</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(calculations.monthlySavings)}
                                  </div>
                                  <div className="text-sm text-green-700">Monthly Savings</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-green-600">
                                    {formatCurrency(calculations.annualSavings)}
                                  </div>
                                  <div className="text-sm text-green-700">Annual Savings</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(calculations.totalSavings5Years)}
                                  </div>
                                  <div className="text-sm text-green-700">5-Year Savings</div>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                                <div className="text-sm text-green-800">
                                  🎉 With Stable Pay's <strong>zero fees</strong>, you keep 100% of your remittance amount!
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {isCalculating && (
                      <Card className="bg-blue-50 border-2 border-blue-200">
                        <CardContent className="p-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-800 font-semibold">Calculating your savings...</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Investment Profile Form */}
                {activeForm === 'investment' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="investmentAmount" className="text-black font-semibold flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          Investment Amount (USDC)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold text-lg">$</span>
                          <Input
                            id="investmentAmount"
                            type="number"
                            placeholder="5000"
                            value={formData.investmentAmount}
                            onChange={(e) => handleInputChange('investmentAmount', Number(e.target.value))}
                            className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] pl-8 text-lg font-semibold"
                          />
                        </div>
                        <div className="text-sm text-[#6667AB]">
                          💡 Minimum investment: $100 USDC
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lockPeriod" className="text-black font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Preferred Lock Period
                        </Label>
                        <Select value={formData.lockPeriod} onValueChange={(value) => handleInputChange('lockPeriod', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 bg-white text-black">
                            <SelectValue placeholder="Select your lock period" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="15-days" className="text-black hover:bg-[#6667AB]/10">⚡ 15 Days (7% APY) - Quick Access</SelectItem>
                            <SelectItem value="1-month" className="text-black hover:bg-[#6667AB]/10">📅 1 Month (8% APY) - Short Term</SelectItem>
                            <SelectItem value="3-months" className="text-black hover:bg-[#6667AB]/10">📊 3 Months (9% APY) - Quarterly</SelectItem>
                            <SelectItem value="6-months" className="text-black hover:bg-[#6667AB]/10">📈 6 Months (10.5% APY) - Mid Term</SelectItem>
                            <SelectItem value="12-months" className="text-black hover:bg-[#6667AB]/10">🎯 12 Months (14% APY) - Maximum Returns</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm text-[#6667AB]">
                          Selected APY: {calculations.projectedYield}% annually
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="riskTolerance" className="text-black font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Risk Tolerance
                        </Label>
                        <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 bg-white text-black">
                            <SelectValue placeholder="Select your risk level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="conservative" className="text-black hover:bg-[#6667AB]/10">🛡️ Conservative - Capital Preservation</SelectItem>
                            <SelectItem value="moderate" className="text-black hover:bg-[#6667AB]/10">⚖️ Moderate - Balanced Growth</SelectItem>
                            <SelectItem value="aggressive" className="text-black hover:bg-[#6667AB]/10">🚀 Aggressive - Maximum Returns</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="primaryGoal" className="text-black font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Primary Goal
                        </Label>
                        <Select value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 bg-white text-black">
                            <SelectValue placeholder="Select your main goal" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="remittance-savings" className="text-black hover:bg-[#6667AB]/10">💰 Remittance Savings</SelectItem>
                            <SelectItem value="investment-growth" className="text-black hover:bg-[#6667AB]/10">📈 Investment Growth</SelectItem>
                            <SelectItem value="both" className="text-black hover:bg-[#6667AB]/10">🎯 Both - Complete Solution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Investment Yield Display */}
                    {!isCalculating && calculations.annualYield > 0 && (
                      <div className="space-y-4">
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                                <span className="text-lg font-semibold text-blue-800">Your Investment Returns</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(calculations.annualYield)}
                                  </div>
                                  <div className="text-sm text-blue-700">Annual Returns</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-blue-600">
                                    {formatCurrency(calculations.totalYield5Years)}
                                  </div>
                                  <div className="text-sm text-blue-700">5-Year Returns</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {calculations.projectedYield}%
                                  </div>
                                  <div className="text-sm text-blue-700">APY Rate</div>
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <div className="text-sm text-blue-800">
                                  🎯 Your investment of {formatCurrency(formData.investmentAmount)} will grow to {formatCurrency(formData.investmentAmount + calculations.totalYield5Years)} over 5 years!
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}


                {/* Common Fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="fullName" className="text-black font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 text-lg"
                        required
                      />
                      <div className="text-sm text-[#6667AB]">
                        👤 Your complete name for verification
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="phoneNumber" className="text-black font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 text-lg"
                        required
                      />
                      <div className="text-sm text-[#6667AB]">
                        📱 Include country code for international numbers
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-black font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 text-lg"
                      required
                    />
                    <div className="text-sm text-[#6667AB]">
                      📧 We'll notify you when early access is available
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="referralSource" className="text-black font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      How did you hear about us?
                    </Label>
                    <Select value={formData.referralSource} onValueChange={(value) => handleInputChange('referralSource', value)}>
                      <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-12 bg-white text-black">
                        <SelectValue placeholder="Select how you found us" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                        <SelectItem value="social-media" className="text-black hover:bg-[#6667AB]/10">📱 Social Media</SelectItem>
                        <SelectItem value="referral" className="text-black hover:bg-[#6667AB]/10">👥 Friend/Family Referral</SelectItem>
                        <SelectItem value="search" className="text-black hover:bg-[#6667AB]/10">🔍 Google Search</SelectItem>
                        <SelectItem value="advertisement" className="text-black hover:bg-[#6667AB]/10">📺 Advertisement</SelectItem>
                        <SelectItem value="news" className="text-black hover:bg-[#6667AB]/10">📰 News Article</SelectItem>
                        <SelectItem value="other" className="text-black hover:bg-[#6667AB]/10">🔧 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Combined Benefits Summary */}
                {calculations.combinedBenefit > 0 && (
                  <Card className="bg-gradient-to-r from-[#6667AB]/10 to-[#6667AB]/5 border-2 border-[#6667AB]/30">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Gift className="w-8 h-8 text-[#6667AB]" />
                          <span className="text-2xl font-bold text-[#6667AB]">Your Total 5-Year Benefit</span>
                        </div>
                        <div className="text-4xl font-bold text-[#6667AB] mb-2">
                          {formatCurrency(calculations.combinedBenefit)}
                        </div>
                        <div className="text-lg text-[#6667AB] mb-4">
                          💰 {formatCurrency(calculations.totalSavings5Years)} in remittance savings<br/>
                          📈 {formatCurrency(calculations.totalYield5Years)} in investment returns
                        </div>
                        <div className="p-4 bg-[#6667AB]/10 rounded-lg">
                          <div className="text-sm text-[#6667AB] font-semibold">
                            🎉 This is what you could save and earn with Stable Pay over 5 years!
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white font-semibold py-6 px-8 rounded-2xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {isConnected ? "Submitting..." : "Connecting Wallet..."}
                    </>
                  ) : (
                    <>
                      <Star className="w-6 h-6 mr-3" />
                      {isConnected ? "Submit Early Access Request" : "Connect Wallet & Get Early Access"}
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>

                {isConnected && (
                  <div className="text-center">
                    <div className="text-sm text-[#6667AB] mb-2">
                      ✅ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => disconnect()}
                      className="text-[#6667AB] border-[#6667AB] hover:bg-[#6667AB]/10"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 no-blur">
              Why Join Early Access?
            </h2>
            <p className="text-xl brand-text max-w-3xl mx-auto no-blur">
              Be part of the first wave of users to experience the future of remittances and DeFi yields.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="brand-card text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-[#6667AB]" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4 no-blur">Priority Access</h3>
                <p className="text-[#6667AB] no-blur">
                  Be among the first to access the platform when it launches. No waiting lists for early access users.
                </p>
              </CardContent>
            </Card>

            <Card className="brand-card text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-[#6667AB]" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4 no-blur">Bonus APY</h3>
                <p className="text-[#6667AB] no-blur">
                  Early access users get an additional 0.5% APY bonus for the first 3 months of platform usage.
                </p>
              </CardContent>
            </Card>

            <Card className="brand-card text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-[#6667AB]" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4 no-blur">Exclusive Support</h3>
                <p className="text-[#6667AB] no-blur">
                  Get dedicated support and direct access to our team during the early access period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-[#6667AB] flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              🎉 Early Access Request Submitted Successfully!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* User Information & Wallet Status */}
            <Card className="bg-green-50 border-2 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-800">Welcome, {formData.fullName}!</div>
                      <div className="text-sm text-green-700">
                        Your early access request has been submitted successfully
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-800">Wallet Connected</div>
                      <div className="text-sm text-green-700">
                        Address: {address?.slice(0, 8)}...{address?.slice(-6)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Calculation Results */}
            <Card className="bg-gradient-to-r from-[#6667AB]/10 to-[#6667AB]/5 border-2 border-[#6667AB]/30">
              <CardHeader>
                <CardTitle className="text-xl text-center text-[#6667AB]">
                  Your Potential 5-Year Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculations.totalSavings5Years)}
                    </div>
                    <div className="text-sm text-gray-600">Remittance Savings</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(calculations.monthlySavings)}/month saved
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculations.totalYield5Years)}
                    </div>
                    <div className="text-sm text-gray-600">Investment Returns</div>
                    <div className="text-xs text-gray-500">
                      {calculations.projectedYield}% APY
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-[#6667AB]/10 rounded-lg">
                  <div className="text-3xl font-bold text-[#6667AB]">
                    {formatCurrency(calculations.combinedBenefit)}
                  </div>
                  <div className="text-lg text-[#6667AB] font-semibold">
                    Total 5-Year Benefit
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="font-semibold text-blue-800 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    What Happens Next?
                  </div>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>✅ Your early access request has been recorded</li>
                    <li>📧 You'll receive email updates about platform launch</li>
                    <li>🎯 Priority access when the platform goes live</li>
                    <li>🎁 Bonus 0.5% APY for first 3 months</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="flex-1 bg-[#6667AB] hover:bg-[#6667AB]/90 text-white"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  // Reset form or redirect
                  window.location.href = '/';
                }}
                variant="outline"
                className="flex-1 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
