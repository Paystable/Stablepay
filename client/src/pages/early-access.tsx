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
import { useToast } from "@/hooks/use-toast";
import { submitEarlyAccess, type EarlyAccessSubmission } from "@/lib/early-access-api";
import { useAccount, useConnect } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { useGoogleAnalyticsContext } from "@/components/google-analytics-provider";
import type { UseGoogleAnalyticsReturn } from "@/hooks/use-google-analytics";
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
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting, error: connectError } = useConnect();
  const analytics = useGoogleAnalyticsContext();
  const { trackEngagement, trackFormSubmission, trackTransaction } = analytics;
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
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const { toast } = useToast();

  // Separate wallet connection function
  const connectWallet = async () => {
    if (isConnectingWallet) return false;
    
    setIsConnectingWallet(true);
    
    try {
      // Check if we're on HTTPS (required for wallets in production)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        toast({
          title: "HTTPS Required",
          description: "Wallet connection requires HTTPS. Please use the secure version of this site.",
          variant: "destructive",
        });
        return false;
      }
      
      // Show connecting message
      toast({
        title: "Connecting Wallet...",
        description: "Please approve the connection in your wallet.",
        variant: "default",
      });
      
      // Call the connect function
      connect({
        connector: coinbaseWallet({
          appName: 'StablePay',
          appLogoUrl: window.location.origin + '/stablepay-logo.png'
        })
      });
      
      // Wait for connection to complete with multiple checks
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isConnected && address) {
          // Show success message
          toast({
            title: "Wallet Connected!",
            description: "Your wallet has been connected successfully.",
            variant: "default",
          });
          return true;
        }
        
        attempts++;
      }
      
      // If we get here, connection failed
      throw new Error('Connection timeout - wallet not connected');
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      // Provide more specific error messages
      let errorMessage = "Please try connecting your wallet again.";
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMessage = "Wallet connection was cancelled. Please try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Connection timed out. Please try again.";
        } else if (error.message.includes('HTTPS')) {
          errorMessage = "HTTPS is required for wallet connection.";
        }
      }
      
      toast({
        title: "Wallet Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnectingWallet(false);
    }
  };

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

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      console.error('Wallet connection error:', connectError);
      toast({
        title: "Wallet Connection Error",
        description: "Please try connecting your wallet again.",
        variant: "destructive",
      });
    }
  }, [connectError, toast]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a wallet connection error
      if (event.reason && (
        event.reason.message?.includes('wallet') ||
        event.reason.message?.includes('connection') ||
        event.reason.message?.includes('user rejected') ||
        event.reason.message?.includes('User rejected')
      )) {
        toast({
          title: "Wallet Connection Failed",
          description: "Please try connecting your wallet again.",
          variant: "destructive",
        });
        event.preventDefault(); // Prevent the default error handling
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [toast]);


  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission attempt
    trackEngagement('early_access_form_submit_attempt', {
      form_type: activeForm,
      has_wallet: isConnected,
    });
    
    if (!formData.fullName) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name to continue.",
        variant: "destructive",
      });
      trackFormSubmission('early_access', false, 'Missing full name');
      return;
    }
    
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      trackFormSubmission('early_access', false, 'Missing email');
      return;
    }
    
    if (!formData.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to continue.",
        variant: "destructive",
      });
      trackFormSubmission('early_access', false, 'Missing phone number');
      return;
    }

    // Handle wallet connection if not connected
    if (!isConnected || !address) {
      const walletConnected = await connectWallet();
      if (!walletConnected) {
        trackFormSubmission('early_access', false, 'Wallet connection failed');
        return;
      }
    }


    setIsSubmitting(true);

    try {
      // Submit form data to AWS API
      const submissionData: EarlyAccessSubmission = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        formType: activeForm,
        walletAddress: address,
        // Financial fields
        monthlyRemittance: formData.monthlyRemittance,
        investmentAmount: formData.investmentAmount,
        currentService: formData.currentService,
        lockPeriod: formData.lockPeriod,
        riskTolerance: formData.riskTolerance,
        primaryGoal: formData.primaryGoal,
        referralSource: formData.referralSource,
        // Calculations
        calculations: {
          monthlyAmount: formData.monthlyRemittance,
          totalSavings5Years: calculations.totalSavings5Years,
          totalYield5Years: calculations.totalYield5Years,
          apy: calculations.projectedYield,
          annualSavings: calculations.annualSavings,
          monthlySavings: calculations.monthlySavings,
          projectedYield: calculations.projectedYield,
          annualYield: calculations.annualYield,
          combinedBenefit: calculations.combinedBenefit
        } as any
      };

      const result = await submitEarlyAccess(submissionData);

      // Track successful form submission
      trackFormSubmission('early_access', true);
      trackEngagement('early_access_registration_success', {
        form_type: activeForm,
        monthly_remittance: formData.monthlyRemittance,
        investment_amount: formData.investmentAmount,
        referral_source: formData.referralSource,
      });

      // Show success dialog with results
      setShowSuccessDialog(true);
      
      toast({
        title: "🎉 Early Access Request Submitted!",
        description: `Welcome ${formData.fullName}! Your early access request has been submitted successfully!`,
      });

    } catch (error) {
      console.error('Submission error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Email already registered')) {
          trackFormSubmission('early_access', true, 'Already registered');
          trackEngagement('early_access_already_registered', {
            form_type: activeForm,
            email: formData.email,
          });
          
          toast({
            title: "Already Registered! 🎉",
            description: "You're already on our early access list! We'll notify you when the platform launches.",
            variant: "default",
          });
          setShowSuccessDialog(true);
          return;
        }
      }
      
      // Track form submission failure
      trackFormSubmission('early_access', false, error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Submission Failed",
        description: "Please try again. If the issue persists, please contact support.",
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
      <section className="pt-6 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-12 brand-bg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge className="bg-[#6667AB] text-white border-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold mb-4 sm:mb-6 rounded-full">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Early Access Program
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-4 sm:mb-6 md:mb-8 no-blur leading-tight px-2">
              Join the{" "}
              <span className="brand-text">Remittance Revolution</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl brand-text max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-10 no-blur leading-relaxed px-2">
              Be among the first to experience zero-fee remittances and up to 14% APY returns. 
              Join 1,000+ NRIs already saving thousands annually.
            </p>

          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Form Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
            {formTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeForm === tab.id ? "default" : "outline"}
                className={`flex-1 h-auto p-4 sm:p-5 md:p-6 ${
                  activeForm === tab.id
                    ? "bg-[#6667AB] text-white hover:bg-[#6667AB]/90"
                    : "border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                }`}
                onClick={() => setActiveForm(tab.id as any)}
              >
                <div className="text-center">
                  <tab.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mx-auto mb-2 sm:mb-3" />
                  <div className="font-semibold text-sm sm:text-base md:text-lg leading-tight">{tab.label}</div>
                  <div className="text-xs sm:text-sm opacity-80 mt-1 hidden sm:block">{tab.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Form Content */}
          <Card className="brand-card">
            <CardHeader className="p-4 sm:p-6 md:p-8">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center text-black no-blur flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                {activeForm === 'savings' && (
                  <>
                    <Calculator className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center">Calculate Your Remittance Savings</span>
                  </>
                )}
                {activeForm === 'investment' && (
                  <>
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center">Build Your Investment Profile</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
                {/* Savings Calculator Form */}
                {activeForm === 'savings' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="monthlyRemittance" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <DollarSign className="w-5 h-5" />
                          Monthly Remittance Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold text-xl">$</span>
                          <Input
                            id="monthlyRemittance"
                            type="number"
                            placeholder="2000"
                            value={formData.monthlyRemittance}
                            onChange={(e) => handleInputChange('monthlyRemittance', Number(e.target.value))}
                            className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] pl-10 h-14 text-xl font-semibold"
                          />
                        </div>
                        <div className="text-sm sm:text-base text-[#6667AB]">
                          💡 Average NRI sends $2,000-5,000 monthly
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="currentService" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <Globe className="w-5 h-5" />
                          Current Service Used
                        </Label>
                        <Select value={formData.currentService} onValueChange={(value) => handleInputChange('currentService', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 bg-white text-black text-lg">
                            <SelectValue placeholder="Select your current service" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="western-union" className="text-black hover:bg-[#6667AB]/10 text-base">🏢 Western Union (4.5% fees)</SelectItem>
                            <SelectItem value="remitly" className="text-black hover:bg-[#6667AB]/10 text-base">🌍 Remitly (3.8% fees)</SelectItem>
                            <SelectItem value="wise" className="text-black hover:bg-[#6667AB]/10 text-base">⚡ Wise (2.5% fees)</SelectItem>
                            <SelectItem value="moneygram" className="text-black hover:bg-[#6667AB]/10 text-base">💸 MoneyGram (4.2% fees)</SelectItem>
                            <SelectItem value="xoom" className="text-black hover:bg-[#6667AB]/10 text-base">🚀 Xoom (3.5% fees)</SelectItem>
                            <SelectItem value="other" className="text-black hover:bg-[#6667AB]/10 text-base">🔧 Other (3.0% avg fees)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm sm:text-base text-[#6667AB]">
                          Current fees: {serviceFees[formData.currentService]}% per transaction
                        </div>
                      </div>
                    </div>

                    {/* Real-time Savings Display */}
                    {!isCalculating && calculations.annualSavings > 0 && (
                      <div className="space-y-6">
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                          <CardContent className="p-6 sm:p-8">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                                <span className="text-xl sm:text-2xl font-semibold text-green-800">Your Potential Savings</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                    {formatCurrency(calculations.monthlySavings)}
                                  </div>
                                  <div className="text-sm sm:text-base text-green-700 font-medium">Monthly Savings</div>
                                </div>
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-3xl sm:text-4xl font-bold text-green-600">
                                    {formatCurrency(calculations.annualSavings)}
                                  </div>
                                  <div className="text-sm sm:text-base text-green-700 font-medium">Annual Savings</div>
                                </div>
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                    {formatCurrency(calculations.totalSavings5Years)}
                                  </div>
                                  <div className="text-sm sm:text-base text-green-700 font-medium">5-Year Savings</div>
                                </div>
                              </div>
                              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                                <div className="text-sm sm:text-base text-green-800">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="investmentAmount" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <Coins className="w-5 h-5" />
                          Investment Amount (USDC)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold text-xl">$</span>
                          <Input
                            id="investmentAmount"
                            type="number"
                            placeholder="5000"
                            value={formData.investmentAmount}
                            onChange={(e) => handleInputChange('investmentAmount', Number(e.target.value))}
                            className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] pl-10 h-14 text-xl font-semibold"
                          />
                        </div>
                        <div className="text-sm sm:text-base text-[#6667AB]">
                          💡 Minimum investment: $100 USDC
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="lockPeriod" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <Clock className="w-5 h-5" />
                          Preferred Lock Period
                        </Label>
                        <Select value={formData.lockPeriod} onValueChange={(value) => handleInputChange('lockPeriod', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 bg-white text-black text-lg">
                            <SelectValue placeholder="Select your lock period" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="15-days" className="text-black hover:bg-[#6667AB]/10 text-base">⚡ 15 Days (7% APY) - Quick Access</SelectItem>
                            <SelectItem value="1-month" className="text-black hover:bg-[#6667AB]/10 text-base">📅 1 Month (8% APY) - Short Term</SelectItem>
                            <SelectItem value="3-months" className="text-black hover:bg-[#6667AB]/10 text-base">📊 3 Months (9% APY) - Quarterly</SelectItem>
                            <SelectItem value="6-months" className="text-black hover:bg-[#6667AB]/10 text-base">📈 6 Months (10.5% APY) - Mid Term</SelectItem>
                            <SelectItem value="12-months" className="text-black hover:bg-[#6667AB]/10 text-base">🎯 12 Months (14% APY) - Maximum Returns</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-sm sm:text-base text-[#6667AB]">
                          Selected APY: {calculations.projectedYield}% annually
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-4">
                        <Label htmlFor="riskTolerance" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <Shield className="w-5 h-5" />
                          Risk Tolerance
                        </Label>
                        <Select value={formData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 bg-white text-black text-lg">
                            <SelectValue placeholder="Select your risk level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="conservative" className="text-black hover:bg-[#6667AB]/10 text-base">🛡️ Conservative - Capital Preservation</SelectItem>
                            <SelectItem value="moderate" className="text-black hover:bg-[#6667AB]/10 text-base">⚖️ Moderate - Balanced Growth</SelectItem>
                            <SelectItem value="aggressive" className="text-black hover:bg-[#6667AB]/10 text-base">🚀 Aggressive - Maximum Returns</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="primaryGoal" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                          <Target className="w-5 h-5" />
                          Primary Goal
                        </Label>
                        <Select value={formData.primaryGoal} onValueChange={(value) => handleInputChange('primaryGoal', value)}>
                          <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 bg-white text-black text-lg">
                            <SelectValue placeholder="Select your main goal" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                            <SelectItem value="remittance-savings" className="text-black hover:bg-[#6667AB]/10 text-base">💰 Remittance Savings</SelectItem>
                            <SelectItem value="investment-growth" className="text-black hover:bg-[#6667AB]/10 text-base">📈 Investment Growth</SelectItem>
                            <SelectItem value="both" className="text-black hover:bg-[#6667AB]/10 text-base">🎯 Both - Complete Solution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Investment Yield Display */}
                    {!isCalculating && calculations.annualYield > 0 && (
                      <div className="space-y-6">
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                          <CardContent className="p-6 sm:p-8">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                                <span className="text-xl sm:text-2xl font-semibold text-blue-800">Your Investment Returns</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                    {formatCurrency(calculations.annualYield)}
                                  </div>
                                  <div className="text-sm sm:text-base text-blue-700 font-medium">Annual Returns</div>
                                </div>
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                                    {formatCurrency(calculations.totalYield5Years)}
                                  </div>
                                  <div className="text-sm sm:text-base text-blue-700 font-medium">5-Year Returns</div>
                                </div>
                                <div className="text-center p-4 bg-white/60 rounded-lg">
                                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                    {calculations.projectedYield}%
                                  </div>
                                  <div className="text-sm sm:text-base text-blue-700 font-medium">APY Rate</div>
                                </div>
                              </div>
                              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                                <div className="text-sm sm:text-base text-blue-800">
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
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="fullName" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                        <Users className="w-5 h-5" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 text-lg sm:text-xl"
                        required
                      />
                      <div className="text-sm sm:text-base text-[#6667AB]">
                        👤 Your complete name for verification
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="phoneNumber" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                        <Globe className="w-5 h-5" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 text-lg sm:text-xl"
                        required
                      />
                      <div className="text-sm sm:text-base text-[#6667AB]">
                        📱 Include country code for international numbers
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                      <Star className="w-5 h-5" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 text-lg sm:text-xl"
                      required
                    />
                    <div className="text-sm sm:text-base text-[#6667AB]">
                      📧 We'll notify you when early access is available
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="referralSource" className="text-black font-semibold flex items-center gap-2 text-base sm:text-lg">
                      <Globe className="w-5 h-5" />
                      How did you hear about us?
                    </Label>
                    <Select value={formData.referralSource} onValueChange={(value) => handleInputChange('referralSource', value)}>
                      <SelectTrigger className="border-2 border-[#6667AB]/30 focus:border-[#6667AB] h-14 bg-white text-black text-lg">
                        <SelectValue placeholder="Select how you found us" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#6667AB]/20 shadow-xl">
                        <SelectItem value="social-media" className="text-black hover:bg-[#6667AB]/10 text-base">📱 Social Media</SelectItem>
                        <SelectItem value="referral" className="text-black hover:bg-[#6667AB]/10 text-base">👥 Friend/Family Referral</SelectItem>
                        <SelectItem value="search" className="text-black hover:bg-[#6667AB]/10 text-base">🔍 Google Search</SelectItem>
                        <SelectItem value="advertisement" className="text-black hover:bg-[#6667AB]/10 text-base">📺 Advertisement</SelectItem>
                        <SelectItem value="news" className="text-black hover:bg-[#6667AB]/10 text-base">📰 News Article</SelectItem>
                        <SelectItem value="other" className="text-black hover:bg-[#6667AB]/10 text-base">🔧 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Combined Benefits Summary */}
                {calculations.combinedBenefit > 0 && (
                  <Card className="bg-gradient-to-r from-[#6667AB]/10 to-[#6667AB]/5 border-2 border-[#6667AB]/30">
                    <CardContent className="p-6 sm:p-8">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-[#6667AB]" />
                          <span className="text-2xl sm:text-3xl font-bold text-[#6667AB]">Your Total 5-Year Benefit</span>
                        </div>
                        <div className="text-4xl sm:text-5xl font-bold text-[#6667AB] mb-4">
                          {formatCurrency(calculations.combinedBenefit)}
                        </div>
                        <div className="text-lg sm:text-xl text-[#6667AB] mb-6">
                          💰 {formatCurrency(calculations.totalSavings5Years)} in remittance savings<br/>
                          📈 {formatCurrency(calculations.totalYield5Years)} in investment returns
                        </div>
                        <div className="p-4 sm:p-6 bg-[#6667AB]/10 rounded-lg">
                          <div className="text-sm sm:text-base text-[#6667AB] font-semibold">
                            🎉 This is what you could save and earn with Stable Pay over 5 years!
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Wallet Status Display */}
                {isConnected && address && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Wallet Connected:</span>
                        </div>
                        <div className="font-mono text-xs text-green-700">
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || isConnecting || isConnectingWallet}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white font-semibold py-6 sm:py-8 px-6 sm:px-10 rounded-2xl text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 sm:mr-4"></div>
                      <span className="text-base sm:text-lg">Submitting...</span>
                    </>
                  ) : isConnecting || isConnectingWallet ? (
                    <>
                      <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 sm:mr-4"></div>
                      <span className="text-base sm:text-lg">Connecting Wallet...</span>
                    </>
                  ) : isConnected ? (
                    <>
                      <Star className="w-6 h-6 sm:w-7 sm:h-7 mr-3 sm:mr-4 flex-shrink-0" />
                      <span className="text-base sm:text-lg leading-tight">
                        <span className="hidden sm:inline">Submit Early Access Request</span>
                        <span className="sm:hidden">Submit Request</span>
                      </span>
                      <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 ml-3 sm:ml-4 flex-shrink-0" />
                    </>
                  ) : (
                    <>
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 mr-3 sm:mr-4 flex-shrink-0" />
                      <span className="text-base sm:text-lg leading-tight">
                        <span className="hidden sm:inline">Connect Wallet & Submit Request</span>
                        <span className="sm:hidden">Connect & Submit</span>
                      </span>
                      <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 ml-3 sm:ml-4 flex-shrink-0" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 no-blur px-2">
              Why Join Early Access?
            </h2>
            <p className="text-base sm:text-lg md:text-xl brand-text max-w-3xl mx-auto no-blur px-2 leading-relaxed">
              Be part of the first wave of users to experience the future of remittances and DeFi yields.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <Card className="brand-card text-center">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <Zap className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#6667AB]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 no-blur">Priority Access</h3>
                <p className="text-base sm:text-lg text-[#6667AB] no-blur leading-relaxed">
                  Be among the first to access the platform when it launches. No waiting lists for early access users.
                </p>
              </CardContent>
            </Card>

            <Card className="brand-card text-center">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <Award className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#6667AB]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 no-blur">Bonus APY</h3>
                <p className="text-base sm:text-lg text-[#6667AB] no-blur leading-relaxed">
                  Early access users get an additional 0.5% APY bonus for the first 3 months of platform usage.
                </p>
              </CardContent>
            </Card>

            <Card className="brand-card text-center sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                  <Shield className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[#6667AB]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 no-blur">Exclusive Support</h3>
                <p className="text-base sm:text-lg text-[#6667AB] no-blur leading-relaxed">
                  Get dedicated support and direct access to our team during the early access period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm sm:max-w-lg md:max-w-2xl bg-white mx-4 sm:mx-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 md:px-8 pb-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl text-center text-[#6667AB] flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 sm:w-9 sm:h-9 text-green-600" />
              </div>
              <span className="text-center font-bold">🎉 Early Access Request Submitted!</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-4 sm:py-6 px-4 sm:px-6 md:px-8">
            {/* Welcome Notification */}
            <div className="bg-gradient-to-r from-[#6667AB] to-[#8B87E8] rounded-xl p-5 sm:p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-lg sm:text-xl break-words">
                    Welcome, {formData.fullName}!
                  </div>
                  <div className="text-base sm:text-lg text-white/90 leading-relaxed">
                    Your early access request has been submitted successfully!
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Address Display */}
            {address && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                    <h3 className="text-lg sm:text-xl font-bold text-green-800">
                      Connected Wallet
                    </h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="font-mono text-sm sm:text-base text-green-700 break-all">
                      {address}
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 mt-2">
                      Your rewards will be sent to this address
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Your Calculation Results */}
            <div className="bg-gradient-to-r from-[#6667AB]/10 to-[#6667AB]/5 border-2 border-[#6667AB]/30 rounded-xl p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#6667AB]">
                  Your Potential 5-Year Benefits
                </h3>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center p-4 sm:p-5 bg-white rounded-lg border border-green-200">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatCurrency(calculations.totalSavings5Years)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">Remittance Savings</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatCurrency(calculations.monthlySavings)}/month saved
                    </div>
                  </div>
                  <div className="text-center p-4 sm:p-5 bg-white rounded-lg border border-blue-200">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {formatCurrency(calculations.totalYield5Years)}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium">Investment Returns</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {calculations.projectedYield}% APY
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-4 sm:p-6 bg-[#6667AB] rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {formatCurrency(calculations.combinedBenefit)}
                  </div>
                  <div className="text-base sm:text-lg text-white/90 font-semibold">
                    Total 5-Year Benefit
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="font-bold text-blue-800 flex items-center gap-3 text-base sm:text-lg">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  What Happens Next?
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-blue-700">Your early access request has been recorded</span>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">📧</span>
                    </div>
                    <span className="text-sm sm:text-base text-blue-700">You'll receive email updates about platform launch</span>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">🎯</span>
                    </div>
                    <span className="text-sm sm:text-base text-blue-700">Priority access when the platform goes live</span>
                  </div>
                  <div className="flex items-start gap-4 p-3 bg-white/60 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm">🎁</span>
                    </div>
                    <span className="text-sm sm:text-base text-blue-700">Bonus 0.5% APY for first 3 months</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="flex-1 bg-[#6667AB] hover:bg-[#6667AB]/90 text-white text-base sm:text-lg py-4 sm:py-4 rounded-xl font-semibold shadow-lg"
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
                className="flex-1 border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-base sm:text-lg py-4 sm:py-4 rounded-xl font-semibold"
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
