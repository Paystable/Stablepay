import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletConnection from "@/components/wallet-connection";
import EarlyAccessButton from "@/components/early-access-button";
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
  Calculator
} from "lucide-react";

export default function TargetAudiences() {
  const audiences = [
    {
      icon: Globe,
      title: "Non-Resident Indians (NRIs)",
      subtitle: "Access high-yield India assets with self-custody vault delivering 1-2% monthly returns",
      description: "Perfect for NRIs seeking high-yield investment opportunities in India with complete regulatory compliance and self-custody control.",
      features: [
        "No physical presence required",
        "Full repatriation rights", 
        "FEMA compliant reporting"
      ],
      buttonText: "Get Started as NRI",
      buttonIcon: ArrowRight,
      cardColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: Crown,
      title: "High Net Worth Individuals",
      subtitle: "Short-term liquidity with superior returns through 15-day cycles and no lock-in",
      description: "Designed for HNI investors who value flexibility, superior returns, and professional portfolio management with quick liquidity cycles.",
      features: [
        "15-day payout cycles",
        "Auto-reporting dashboard",
        "Portfolio diversification"
      ],
      buttonText: "HNI Portfolio Access",
      buttonIcon: Crown,
      cardColor: "bg-[#6667AB]/5",
      iconBg: "bg-[#6667AB]/10", 
      iconColor: "text-[#6667AB]",
      borderColor: "border-[#6667AB]/30",
      highlight: true
    },
    {
      icon: Building2,
      title: "Corporate Treasuries",
      subtitle: "FDI into India with treasury controls, KYB onboarding, and compliance panel",
      description: "Enterprise-grade solutions for corporate treasuries looking to invest in India with full compliance, multi-signature controls, and dedicated support.",
      features: [
        "KYB corporate onboarding",
        "FIU compliance panel",
        "Multi-signature controls"
      ],
      buttonText: "Corporate Onboarding",
      buttonIcon: FileText,
      cardColor: "bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600", 
      borderColor: "border-green-200"
    }
  ];

  return (
    <section id="audiences" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-[#6667AB] text-white border-none px-6 py-3 text-base font-semibold mb-6 rounded-full">
            <Users className="w-5 h-5 mr-2" />
            Target Audiences
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 no-blur">
            Built for Every Investor Type
          </h2>
          <p className="text-lg sm:text-xl text-[#6667AB] max-w-4xl mx-auto leading-relaxed no-blur">
            From NRIs seeking India exposure to corporate treasuries optimizing returns, 
            our platform delivers tailored solutions with institutional-grade security and regulatory compliance.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {audiences.map((audience, index) => (
            <Card 
              key={index} 
              className={`${audience.cardColor} ${audience.borderColor} border-2 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden group`}
            >
              <CardHeader className="text-center pb-4 p-8">
                <div className={`w-20 h-20 ${audience.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <audience.icon className={`w-10 h-10 ${audience.iconColor}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-black mb-2 no-blur">
                  {audience.title}
                </CardTitle>
                <p className="text-sm font-semibold text-[#6667AB] mb-4 no-blur">
                  {audience.subtitle}
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <p className="text-[#6667AB] leading-relaxed mb-6 no-blur">
                  {audience.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-black text-sm uppercase tracking-wide no-blur">Key Features:</h4>
                  {audience.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-[#6667AB] font-medium leading-relaxed no-blur">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-[#6667AB]" />
            </div>
            <div className="text-3xl font-bold text-black mb-2 no-blur">Up to 14%</div>
            <div className="text-[#6667AB] font-medium no-blur">Progressive APY Returns</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#6667AB]" />
            </div>
            <div className="text-3xl font-bold text-black mb-2 no-blur">100%</div>
            <div className="text-[#6667AB] font-medium no-blur">Regulatory Compliant</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#6667AB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-[#6667AB]" />
            </div>
            <div className="text-3xl font-bold text-black mb-2 no-blur">15</div>
            <div className="text-[#6667AB] font-medium no-blur">Day Payout Cycles</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#6667AB]/5 rounded-3xl p-12 border-2 border-[#6667AB]/20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#6667AB] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black no-blur">
                Ready to Start Your Investment Journey?
              </h3>
            </div>
            <p className="text-xl text-[#6667AB] mb-8 leading-relaxed no-blur">
              Join global investors earning consistent returns with regulatory compliance, complete transparency, and institutional-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <EarlyAccessButton />
              {/* Hidden wallet connection for future use */}
              <div className="hidden">
                <WalletConnection />
              </div>
              <Button 
                className="border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 bg-white px-10 py-4 text-lg rounded-xl font-semibold"
                onClick={() => window.open('https://calendly.com/hello-stablepay/30min', '_blank')}
              >
                Schedule Consultation
                <FileText className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[#6667AB]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium no-blur">FIU(Financial Intelligence Unit)-India Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium no-blur">Self-Custody</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium no-blur">Up to 14% APY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}