import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Wallet,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Users,
  Globe,
  Coins,
  Sparkles
} from "lucide-react";

interface WalletSetupFlowProps {
  onSetupComplete?: (address: string) => void;
  onSkip?: () => void;
  className?: string;
}

export default function WalletSetupFlow({ 
  onSetupComplete, 
  onSkip,
  className = ""
}: WalletSetupFlowProps) {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [isNewWallet, setIsNewWallet] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const steps = [
    {
      id: 'detect',
      title: 'Wallet Detection',
      description: 'Checking your wallet status...',
      icon: Wallet,
      color: 'text-blue-600'
    },
    {
      id: 'onboard',
      title: 'Welcome to StablePay',
      description: 'Setting up your account...',
      icon: Star,
      color: 'text-purple-600'
    },
    {
      id: 'benefits',
      title: 'Your Benefits',
      description: 'Discover what you can save and earn...',
      icon: Coins,
      color: 'text-green-600'
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'You\'re ready to start!',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  useEffect(() => {
    if (isConnected && address) {
      checkWalletStatus();
    }
  }, [isConnected, address]);

  const checkWalletStatus = async () => {
    try {
      setCurrentStep(0);
      
      // Simulate wallet status check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if this is a new wallet
      const response = await fetch(`/api/travel-rule/wallet-status/${address}`);
      if (response.ok) {
        const data = await response.json();
        setIsNewWallet(data.isNewWallet || false);
      } else {
        setIsNewWallet(true);
      }
      
      setCurrentStep(1);
      
      // Simulate onboarding process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(2);
      
      // Show benefits
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCurrentStep(3);
      setSetupComplete(true);
      
      onSetupComplete?.(address);
    } catch (error) {
      console.error('Error during wallet setup:', error);
      // Continue with setup even if API fails
      setIsNewWallet(true);
      setCurrentStep(1);
      
      setTimeout(() => {
        setCurrentStep(2);
        setTimeout(() => {
          setCurrentStep(3);
          setSetupComplete(true);
          onSetupComplete?.(address);
        }, 3000);
      }, 2000);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-[#6667AB]/10 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[#6667AB]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">Wallet Setup</h3>
            <p className="text-sm text-gray-600">
              {isNewWallet ? 'Welcome! Setting up your new account...' : 'Welcome back! Updating your account...'}
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="brand-card">
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-black">Detecting Wallet</h4>
              <p className="text-gray-600">Checking your wallet connection and status...</p>
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-black">
                {isNewWallet ? 'Welcome to StablePay!' : 'Welcome back!'}
              </h4>
              <p className="text-gray-600">
                {isNewWallet 
                  ? 'We\'re setting up your new account with exclusive early access benefits.'
                  : 'We\'re updating your account with the latest features.'
                }
              </p>
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-black mb-2">Your Early Access Benefits</h4>
                <p className="text-gray-600">Here's what you get as an early access member:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800">Zero Fees</div>
                    <div className="text-sm text-green-700">No transaction fees on remittances</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Coins className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-800">Up to 14% APY</div>
                    <div className="text-sm text-blue-700">Earn on your USDC investments</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-purple-800">Priority Support</div>
                    <div className="text-sm text-purple-700">Direct access to our team</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <Star className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-orange-800">Bonus APY</div>
                    <div className="text-sm text-orange-700">+0.5% bonus for 3 months</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-black">Setup Complete!</h4>
              <p className="text-gray-600">
                Your wallet is connected and your account is ready. You can now submit your early access request.
              </p>
              
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800 font-semibold mb-2">Wallet Connected</div>
                <div className="text-xs text-green-700 font-mono">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skip Button (only show during setup) */}
      {!setupComplete && (
        <div className="text-center">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Skip Setup
          </Button>
        </div>
      )}
    </div>
  );
}
