import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Shield, 
  TrendingUp, 
  Globe, 
  Clock, 
  Eye,
  Award,
  Zap,
  Building2,
  CheckCircle,
  Target,
  Users,
  DollarSign
} from "lucide-react";
import {Calculator} from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: DollarSign,
      title: "Zero Fees Remittance",
      subtitle: "Save 4% on Every Transfer",
      description: "Send money to India with zero transfer fees. Banks and MTOs charge 4% average fees, significantly reducing your actual investment returns.",
      highlights: ["0% Transfer Fees", "Instant Settlement", "Direct Investment"],
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: TrendingUp,
      title: "Up to 14% Net APY",
      subtitle: "True Returns Without Hidden Costs",
      description: "Earn up to 14% APY with zero deductions. Traditional platforms reduce your 7% FD returns to just 3% after transfer fees.",
      highlights: ["No Fee Deductions", "Full APY Retained", "Compound Growth"],
      gradientFrom: "from-blue-500",
      gradientTo: "to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Calculator,
      title: "Real Returns Comparison",
      subtitle: "See Your True Investment Value",
      description: "Traditional: 7% FD - 4% fees = 3% net return. Stable Pay: 14% APY with zero fees = 14% net return. That's 4.7x better returns.",
      highlights: ["4.7x Better Returns", "No Hidden Costs", "Transparent Pricing"],
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: Globe,
      title: "NRI-Optimized Platform",
      subtitle: "Built for Global Indians",
      description: "Specifically designed for NRIs who want to invest in India without losing money to transfer fees. Direct USDC investment with instant liquidity.",
      highlights: ["NRI Focused", "FEMA Compliant", "Global Access"],
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Shield,
      title: "FIU-IND Regulated",
      subtitle: "Fully Compliant & Secure",
      description: "Licensed and monitored by Financial Intelligence Unit of India. Self-custodial smart contracts ensure your funds remain in your control.",
      highlights: ["Government Registered", "Self-Custodial", "Full Transparency"],
      gradientFrom: "from-teal-500",
      gradientTo: "to-cyan-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200"
    },
    {
      icon: Zap,
      title: "Instant Access",
      subtitle: "No Lock-in Periods",
      description: "Access your funds anytime with Base network integration. Choose flexible terms from 15 days to 12 months or keep funds liquid.",
      highlights: ["Instant Withdrawals", "Flexible Terms", "Base Network"],
      gradientFrom: "from-yellow-500",
      gradientTo: "to-amber-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    }
  ];

  const stats = [
    {
      icon: DollarSign,
      value: "0%",
      label: "Transfer Fees",
      description: "Save 3-5% on every remittance"
    },
    {
      icon: TrendingUp,
      value: "14%",
      label: "Maximum APY",
      description: "Without any fee deductions"
    },
    {
      icon: Calculator,
      value: "3-5x",
      label: "Better Returns",
      description: "Vs traditional FD + fees"
    },
    {
      icon: Users,
      value: "1,200+",
      label: "NRI Investors",
      description: "Saving on transfer costs"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge className="bg-[#6667AB] text-white border-none px-6 py-3 text-base font-semibold mb-6 rounded-full">
            <DollarSign className="w-5 h-5 mr-2" />
            Why Choose Stable Pay?
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 no-blur">
            Zero Fees, Maximum Returns
          </h2>
          <p className="text-lg sm:text-xl text-[#6667AB] max-w-4xl mx-auto leading-relaxed no-blur">
            Stop losing 3-5% to transfer fees. Get the full 14% APY with zero hidden costs. 
            Traditional platforms eat your returns - we preserve every rupee of your investment.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 border-[#6667AB]/20 bg-gradient-to-br from-white to-[#6667AB]/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-[#6667AB]" />
                </div>
                <div className="text-3xl font-bold text-black mb-2 no-blur">{stat.value}</div>
                <div className="text-sm font-semibold text-[#6667AB] mb-1 no-blur">{stat.label}</div>
                <div className="text-xs text-[#6667AB]/70 no-blur">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white border-2 border-[#6667AB]/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#6667AB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#6667AB]" />
                </div>
                <CardTitle className="text-xl font-bold text-black mb-2 no-blur">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-6 pb-6">
                <p className="text-[#6667AB] leading-relaxed no-blur">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fee Comparison Section */}
        <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-3xl p-8 border-2 border-[#6667AB]/20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-black mb-4 no-blur">Real Impact of Transfer Fees</h3>
            <p className="text-lg text-[#6667AB] no-blur">See how traditional platform fees destroy your investment returns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traditional Platform */}
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-800 no-blur">Traditional Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 no-blur">₹1,00,000 Investment</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-700 no-blur">Transfer Fees (4%):</span>
                    <span className="font-bold text-red-800 no-blur">-₹4,000</span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-700 no-blur">Amount Invested:</span>
                    <span className="font-bold text-red-800 no-blur">₹96,000</span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-700 no-blur">FD Return (7% APY):</span>
                    <span className="font-bold text-red-800 no-blur">₹6,720</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-red-300 pt-2">
                    <span className="text-red-700 font-semibold no-blur">Net Return on ₹1L:</span>
                    <span className="font-bold text-red-900 text-lg no-blur">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stable Pay Platform */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800 no-blur">Stable Pay Platform</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 no-blur">₹1,00,000 Investment</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="text-green-700 no-blur">Transfer Fees:</span>
                    <span className="font-bold text-green-800 no-blur">₹0 (Zero Fees)</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="text-green-700 no-blur">Amount Invested:</span>
                    <span className="font-bold text-green-800 no-blur">₹1,00,000 (Full Amount)</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200 pb-2">
                    <span className="text-green-700 no-blur">APY Return (14%):</span>
                    <span className="font-bold text-green-800 no-blur">₹14,000</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-green-300 pt-2">
                    <span className="text-green-700 font-semibold no-blur">Net Return on ₹1L:</span>
                    <span className="font-bold text-green-900 text-lg no-blur">14%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8 p-6 bg-[#6667AB]/10 rounded-2xl">
            <h4 className="text-2xl font-bold text-[#6667AB] mb-2 no-blur">Stable Pay Advantage</h4>
            <p className="text-xl text-black no-blur">
              <span className="font-bold text-green-600">3-5x Better Returns</span> + 
              <span className="font-bold text-green-600"> ₹3,000-₹5,000 Saved</span> in transfer fees
            </p>
            <p className="text-sm text-[#6667AB] mt-2 no-blur">
              Every year, you save thousands in fees while earning significantly higher returns
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}