
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import WalletConnection from "@/components/wallet-connection";
import { 
  TrendingUp, 
  Shield, 
  Building2, 
  CheckCircle, 
  ArrowRight, 
  Award, 
  Crown, 
  DollarSign, 
  Clock,
  Users,
  Globe,
  FileText,
  Calculator,
  Target,
  PieChart,
  BarChart3,
  Wallet,
  Lock,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Download
} from "lucide-react";

export default function Investors() {
  const keyMetrics = [
    { label: "Total Value Locked", value: "₹50L+", icon: TrendingUp },
    { label: "Active Investors", value: "1,200+", icon: Users },
    { label: "Maximum APY", value: "14%", icon: Award },
    { label: "Platform Uptime", value: "99.9%", icon: Shield }
  ];

  const investmentTiers = [
    {
      period: "15 Days",
      apy: "7%",
      minAmount: "$1,000",
      description: "Short-term liquidity with quick returns",
      features: ["Instant withdrawal", "No lock-in", "Perfect for testing"]
    },
    {
      period: "3 Months", 
      apy: "9%",
      minAmount: "$5,000",
      description: "Balanced approach for steady growth",
      features: ["Quarterly returns", "Flexible terms", "Auto-reinvest option"]
    },
    {
      period: "6 Months",
      apy: "10.5%", 
      minAmount: "$10,000",
      description: "Enhanced returns for committed investors",
      features: ["Higher yields", "Priority support", "Premium features"]
    },
    {
      period: "12 Months",
      apy: "14%",
      minAmount: "$25,000",
      description: "Maximum returns for long-term commitment",
      features: ["Highest APY", "VIP treatment", "Exclusive benefits"]
    }
  ];

  const targetAudiences = [
    {
      title: "Non-Resident Indians (NRIs)",
      description: "Access high-yield India assets with self-custody vault delivering 1-2% monthly returns",
      benefits: ["No physical presence required", "Full repatriation rights", "FEMA compliant reporting"],
      icon: Globe
    },
    {
      title: "High Net Worth Individuals", 
      description: "Short-term liquidity with superior returns through 15-day cycles and no lock-in",
      benefits: ["15-day payout cycles", "Auto-reporting dashboard", "Portfolio diversification"],
      icon: Crown
    },
    {
      title: "Corporate Treasuries",
      description: "FDI into India with treasury controls, KYB onboarding, and compliance panel", 
      benefits: ["KYB corporate onboarding", "FIU compliance panel", "Multi-signature controls"],
      icon: Building2
    }
  ];

  const riskFactors = [
    {
      title: "Market Risk",
      description: "Cryptocurrency market volatility may affect returns",
      mitigation: "Diversified arbitrage across 50+ exchanges minimizes exposure"
    },
    {
      title: "Regulatory Risk", 
      description: "Changes in crypto regulations could impact operations",
      mitigation: "FIU-IND registered with proactive regulatory compliance"
    },
    {
      title: "Technology Risk",
      description: "Smart contract vulnerabilities or system failures",
      mitigation: "Regular audits, multi-sig security, and battle-tested infrastructure"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-[#6667AB] text-white border-none px-6 py-3 text-base font-semibold mb-6 rounded-full">
              <TrendingUp className="w-5 h-5 mr-2" />
              Investor Information
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 no-blur">
              Invest in the Future of{" "}
              <span className="brand-text">DeFi Remittance</span>
            </h1>
            <p className="text-xl brand-text mb-8 max-w-4xl mx-auto no-blur">
              Join institutional and retail investors earning up to 14% APY through our regulated, 
              self-custodial arbitrage platform on Base network.
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="brand-card rounded-xl p-4 text-center">
                  <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center mx-auto mb-2">
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-black no-blur">{metric.value}</div>
                  <div className="text-sm brand-text no-blur">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12">
              <TabsTrigger value="overview">Platform Overview</TabsTrigger>
              <TabsTrigger value="investment">Investment Options</TabsTrigger>
              <TabsTrigger value="equity">Equity Investment</TabsTrigger>
              <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            </TabsList>

            {/* Platform Overview */}
            <TabsContent value="overview" className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-6 no-blur">How Stable Pay Works</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black mb-2 no-blur">AI-Powered Arbitrage</h3>
                        <p className="brand-text no-blur">
                          Our AI algorithms monitor 50+ exchanges 24/7, identifying price differences 
                          and executing profitable trades within milliseconds.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black mb-2 no-blur">Self-Custodial Security</h3>
                        <p className="brand-text no-blur">
                          You maintain complete control of your funds through smart contracts on Base network. 
                          No counterparty risk, no centralized custody.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-black mb-2 no-blur">Regulatory Compliance</h3>
                        <p className="brand-text no-blur">
                          FIU-IND registered with full AML/KYC compliance. Transparent operations 
                          with institutional-grade reporting and audit trails.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-black mb-6 no-blur">Target Audiences</h2>
                  <div className="space-y-4">
                    {targetAudiences.map((audience, index) => (
                      <Card key={index} className="border-[#6667AB]/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <audience.icon className="w-8 h-8 brand-text" />
                            <CardTitle className="text-lg text-black no-blur">{audience.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="brand-text text-sm mb-3 no-blur">{audience.description}</p>
                          <div className="space-y-1">
                            {audience.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="brand-text no-blur">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Investment Options */}
            <TabsContent value="investment" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-black mb-4 no-blur">Progressive APY Structure</h2>
                <p className="text-xl brand-text no-blur">
                  Choose your investment period and earn corresponding returns with full flexibility
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {investmentTiers.map((tier, index) => (
                  <Card key={index} className="border-[#6667AB]/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 brand-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-black no-blur">{tier.period} Lock</CardTitle>
                      <div className="text-3xl font-bold brand-text no-blur">{tier.apy} APY</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-black no-blur">Min: {tier.minAmount}</div>
                        <p className="text-sm brand-text no-blur">{tier.description}</p>
                      </div>
                      <div className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="brand-text no-blur">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Investment Calculator */}
              <Card className="border-[#6667AB]/20 bg-[#6667AB]/5">
                <CardHeader>
                  <CardTitle className="text-2xl text-black flex items-center gap-3 no-blur">
                    <Calculator className="w-8 h-8 brand-text" />
                    Investment Returns Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-black mb-4 no-blur">$10,000 Investment</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">3 Months (9% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$10,225</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">6 Months (10.5% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$10,525</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm brand-text no-blur">12 Months (14% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$1,400</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-black mb-4 no-blur">$50,000 Investment</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">3 Months (9% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$51,125</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">6 Months (10.5% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$52,625</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm brand-text no-blur">12 Months (14% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$57,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-black mb-4 no-blur">$100,000 Investment</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">3 Months (9% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$102,250</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm brand-text no-blur">6 Months (10.5% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$105,250</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm brand-text no-blur">12 Months (14% APY):</span>
                          <span className="font-bold text-green-600 no-blur">$114,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <WalletConnection />
              </div>
            </TabsContent>

            {/* Equity Investment */}
            <TabsContent value="equity" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-black mb-4 no-blur">Equity Investment Opportunity</h2>
                <p className="text-xl brand-text no-blur">
                  Join our Series A funding round and become part of India's first regulated DeFi arbitrage platform
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="border-[#6667AB]/20 bg-gradient-to-br from-[#6667AB] to-[#4338ca] text-white">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold mb-4 no-blur">Series A: ₹5 Crores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="no-blur">Technology Development:</span>
                      <span className="font-bold no-blur">₹2Cr (40%)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="no-blur">Marketing & Acquisition:</span>
                      <span className="font-bold no-blur">₹1.5Cr (30%)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/20">
                      <span className="no-blur">Regulatory & Compliance:</span>
                      <span className="font-bold no-blur">₹75L (15%)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="no-blur">Working Capital:</span>
                      <span className="font-bold no-blur">₹75L (15%)</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-[#6667AB]/20">
                    <CardHeader>
                      <CardTitle className="text-xl text-black flex items-center gap-3 no-blur">
                        <BarChart3 className="w-6 h-6 brand-text" />
                        3-Year ROI Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="brand-text no-blur">Initial Investment:</span>
                        <span className="font-bold text-black no-blur">₹5 Crores</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="brand-text no-blur">Projected Valuation (3Y):</span>
                        <span className="font-bold text-green-600 no-blur">₹50 Crores</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-lg text-black no-blur">Expected ROI:</span>
                        <span className="text-2xl font-bold text-green-600 no-blur">10x</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold text-green-800 mb-3 no-blur">Why Invest Now?</h4>
                      <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="no-blur">Proven platform with live users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="no-blur">First-mover in regulated space</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="no-blur">Massive addressable market</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="no-blur">Strong technical foundation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="no-blur">Regulatory compliance achieved</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="border-[#6667AB]/20 bg-[#6667AB]/5">
                <CardContent className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-black mb-4 no-blur">Market Opportunity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <div className="text-3xl font-bold brand-text no-blur">$100B+</div>
                        <div className="text-sm text-black no-blur">NRI Remittances</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold brand-text no-blur">$3.5T</div>
                        <div className="text-sm text-black no-blur">HNI Wealth</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold brand-text no-blur">$500B+</div>
                        <div className="text-sm text-black no-blur">Corporate Treasury</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Risk Analysis */}
            <TabsContent value="risks" className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-black mb-4 no-blur">Risk Analysis & Mitigation</h2>
                <p className="text-xl brand-text no-blur">
                  Transparent risk assessment with comprehensive mitigation strategies
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-bold text-red-600 mb-6 no-blur">Identified Risks</h3>
                  <div className="space-y-4">
                    {riskFactors.map((risk, index) => (
                      <Card key={index} className="border-red-200 bg-red-50">
                        <CardContent className="p-6">
                          <h4 className="font-bold text-red-800 mb-2 no-blur">{risk.title}</h4>
                          <p className="text-sm text-red-700 mb-3 no-blur">{risk.description}</p>
                          <div className="border-t border-red-200 pt-3">
                            <span className="text-xs font-semibold text-red-800 uppercase tracking-wide no-blur">Mitigation:</span>
                            <p className="text-sm text-red-700 mt-1 no-blur">{risk.mitigation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-6 no-blur">Risk-Adjusted Returns</h3>
                  <div className="space-y-6">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-bold text-lg mb-2 text-blue-800 no-blur">Conservative Scenario</h4>
                        <p className="text-3xl font-bold text-blue-600 no-blur">8% APY</p>
                        <p className="text-sm text-blue-600 no-blur">Market downturn conditions</p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-bold text-lg mb-2 text-green-800 no-blur">Base Case</h4>
                        <p className="text-3xl font-bold text-green-600 no-blur">11% APY</p>
                        <p className="text-sm text-green-600 no-blur">Normal market conditions</p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-bold text-lg mb-2 text-purple-800 no-blur">Optimistic Scenario</h4>
                        <p className="text-3xl font-bold text-purple-600 no-blur">14% APY</p>
                        <p className="text-sm text-purple-600 no-blur">High volatility periods</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-[#6667AB]/20 mt-6">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-4 text-black no-blur">Security Measures</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="brand-text no-blur">Multi-signature wallet controls</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-600" />
                          <span className="brand-text no-blur">Regular smart contract audits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="brand-text no-blur">FIU-IND compliance reporting</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="brand-text no-blur">Insurance coverage planned</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-6 no-blur">Ready to Get Started?</h2>
          <p className="text-xl brand-text mb-8 no-blur">
            Whether you're looking to invest as a user or explore equity opportunities, 
            we're here to help you join the future of DeFi remittance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <WalletConnection />
            <Button 
              className="border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 bg-white px-8 py-4 text-lg rounded-xl font-semibold"
              onClick={() => window.open('https://calendly.com/hello-stablepay/30min', '_blank')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Consultation
            </Button>
            <Button 
              className="border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 bg-white px-8 py-4 text-lg rounded-xl font-semibold"
              onClick={() => window.open('/investor-deck', '_blank')}
            >
              <Download className="w-5 h-5 mr-2" />
              View Pitch Deck
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm brand-text">
            <a href="mailto:invest@stablepay.global" className="flex items-center gap-2 hover:underline">
              <Mail className="w-4 h-4" />
              <span className="no-blur">invest@stablepay.global</span>
            </a>
            <a href="https://stablepay.global" className="flex items-center gap-2 hover:underline" target="_blank">
              <ExternalLink className="w-4 h-4" />
              <span className="no-blur">stablepay.global</span>
            </a>
          </div>

          <div className="mt-8 p-4 bg-white/10 rounded-xl border border-[#6667AB]/20">
            <p className="text-sm brand-text no-blur">
              <strong>Smart Contract:</strong> 0x4bc7a35d6e09d102087ed84445137f04540a8790 (Base Network)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
