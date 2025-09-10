
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WalletConnection from "@/components/wallet-connection";
import EarlyAccessButton from "@/components/early-access-button";
import LockPeriodDropdown from "@/components/lock-period-dropdown";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Target, 
  ArrowRight, 
  CheckCircle,
  Clock,
  BarChart3,
  Coins
} from "lucide-react";

interface LockPeriod {
  id: string;
  label: string;
  months: number;
  apy: number;
  description: string;
}

export default function FinanceCalculator() {
  const [amount, setAmount] = useState("100.00");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<LockPeriod>({
    id: "1-month",
    label: "1 Month",
    months: 1,
    apy: 8,
    description: "Higher than traditional savings accounts"
  });

  const lockPeriods: LockPeriod[] = [
    {
      id: "15-days",
      label: "15 Days",
      months: 0.5,
      apy: 7,
      description: "Short-term liquidity with base returns"
    },
    {
      id: "1-month",
      label: "1 Month", 
      months: 1,
      apy: 8,
      description: "Higher than traditional savings accounts"
    },
    {
      id: "2-months",
      label: "2 Months",
      months: 2,
      apy: 8.5,
      description: "Beat inflation with stable returns"
    },
    {
      id: "3-months",
      label: "3 Months",
      months: 3,
      apy: 9,
      description: "Quarterly commitment with solid gains"
    },
    {
      id: "4-months",
      label: "4 Months",
      months: 4,
      apy: 9.5,
      description: "Extended lock-in for enhanced yield"
    },
    {
      id: "5-months",
      label: "5 Months",
      months: 5,
      apy: 10,
      description: "Mid-term strategy with growing returns"
    },
    {
      id: "6-months",
      label: "6 Months",
      months: 6,
      apy: 10.5,
      description: "Mid-term commitment with enhanced yields"
    },
    {
      id: "7-months",
      label: "7 Months",
      months: 7,
      apy: 11,
      description: "Extended commitment with premium rates"
    },
    {
      id: "8-months",
      label: "8 Months",
      months: 8,
      apy: 11.5,
      description: "Long-term focus with excellent returns"
    },
    {
      id: "9-months",
      label: "9 Months",
      months: 9,
      apy: 12,
      description: "Premium lock-in with superior yields"
    },
    {
      id: "10-months",
      label: "10 Months",
      months: 10,
      apy: 12.5,
      description: "Extended tenure with exceptional rates"
    },
    {
      id: "11-months",
      label: "11 Months",
      months: 11,
      apy: 13,
      description: "Near-annual commitment, premium APY"
    },
    {
      id: "12-months",
      label: "12 Months",
      months: 12,
      apy: 14,
      description: "Maximum tenure with highest returns"
    }
  ];

  const numericAmount = parseFloat(amount) || 0;
  const monthlyReturn = (numericAmount * (selectedPeriod.apy / 100)) / 12;
  const totalReturn = monthlyReturn * selectedPeriod.months;
  const finalValue = numericAmount + totalReturn;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <section id="finance-calculator" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-[#6667AB] text-white border-none px-4 py-2 text-sm font-medium mb-4">
            <Calculator className="w-4 h-4 mr-2" />
            Progressive APY Calculator
          </Badge>
          <h2 className="text-4xl font-bold text-black mb-4">
            Calculate Your Progressive APY Returns
          </h2>
          <p className="text-xl text-[#6667AB] max-w-3xl mx-auto">
            Discover how much you can earn with Stable Pay's progressive APY system. 
            Get up to 14% APY on your USDC deposits with flexible lock periods.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Main Calculator Card */}
          <Card className="border-2 border-[#6667AB] bg-white shadow-xl">
            <CardHeader className="bg-[#6667AB]/5 border-b border-[#6667AB]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6667AB] rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-black">Stable Pay</CardTitle>
                  <CardDescription className="text-[#6667AB]">
                    Self-custodial USDC yields on Base
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Amount Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-black">
                    Deposit USDC
                  </label>
                  <span className="text-sm text-[#6667AB]">
                    Amount (USDC)
                  </span>
                </div>
                
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-bold text-lg">
                    $
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-bold pl-8 pr-16 h-16 border-2 border-[#6667AB]/30 focus:border-[#6667AB] rounded-xl"
                    placeholder="100.00"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#6667AB] font-semibold">
                    USDC
                  </span>
                </div>

                <div className="text-sm text-[#6667AB]">
                  Available: 0.000 USDC
                </div>
              </div>

              {/* Lock Period Dropdown */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-black">
                  Lock Period & APY
                </label>
                
                <LockPeriodDropdown
                  value={`${selectedPeriod.months}-${selectedPeriod.months === 0.5 ? 'days' : 'months'}`}
                  onValueChange={(value) => {
                    const option = lockPeriods.find(opt => 
                      `${opt.months}-${opt.months === 0.5 ? 'days' : 'months'}` === value
                    );
                    if (option) setSelectedPeriod(option);
                  }}
                  className="h-20 text-base"
                />
              </div>

              {/* Progressive APY Info */}
              <Card className="bg-blue-50 border border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Progressive APY System:
                      </h4>
                      <p className="text-sm text-blue-800">
                        Lock-in periods from 15 days to 12 months earn progressive APY up to 14%. 
                        Longer commitments reward you with significantly higher guaranteed returns 
                        up to 14% APY.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Returns Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-black text-lg">Your Returns</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-[#6667AB]/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-[#6667AB] mb-1">Monthly Earnings</div>
                      <div className="text-2xl font-bold text-[#6667AB]">
                        ${formatCurrency(monthlyReturn)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#6667AB]/20">
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-[#6667AB] mb-1">Total Return</div>
                      <div className="text-2xl font-bold text-green-600">
                        +${formatCurrency(totalReturn)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-[#6667AB] bg-[#6667AB]/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-[#6667AB] mb-1">
                          Final Value After {selectedPeriod.label}
                        </div>
                        <div className="text-3xl font-bold text-[#6667AB]">
                          ${formatCurrency(finalValue)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#6667AB]">APY</div>
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPeriod.apy}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Early Access Button */}
              <div className="flex justify-center">
                <EarlyAccessButton />
                {/* Hidden wallet connection for future use */}
                <div className="hidden">
                  <WalletConnection />
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-4 border-t border-[#6667AB]/20">
                <h4 className="font-semibold text-black">Stable Pay Benefits:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#6667AB]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Self-custodial Base network wallet</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6667AB]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>FIU-IND regulated platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6667AB]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Progressive APY up to 14%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6667AB]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Zero fees on all transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6667AB]">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Transparent on-chain yields</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          
          </div>
        </div>
    </section>
  );
}
