import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletConnection from "@/components/wallet-connection";
import EarlyAccessButton from "@/components/early-access-button";
import { 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Award,
  DollarSign,
  Users,
  Globe,
  Clock
} from "lucide-react";

const trustIndicators = [
    {
        icon: CheckCircle,
        title: "Audited Smart Contracts",
        description: "Our smart contracts are secured and audited."
    },
    {
        icon: Shield,
        title: "Self-Custodial Security",
        description: "You always remain in control of your funds."
    },
    {
        icon: Award,
        title: "High Yields",
        description: "Earn industry leading yields with stable returns."
    },
];

export default function Hero() {
  return (
    <section className="pt-8 pb-6 brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left Content */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-black leading-tight no-blur">
                Earn{" "}
                <span className="brand-text">up to 14% APY</span>{" "}
                on USDC Remittance
              </h1>
              <p className="text-lg sm:text-xl brand-text leading-relaxed max-w-xl no-blur">
                Next-gen self-custodial remittance & yield platform. Earn up to 14% yields on USDC 
                with Base network smart wallet integration.
              </p>
            </div>



            <div className="space-y-3">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#6667AB]/20 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-[#6667AB] rounded-lg flex items-center justify-center flex-shrink-0">
                    <indicator.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black text-sm no-blur">{indicator.title}</h4>
                    <p className="text-xs text-[#6667AB] no-blur">{indicator.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <EarlyAccessButton />
              {/* Hidden wallet connection for future use */}
              <div className="hidden">
                <WalletConnection />
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="brand-card rounded-2xl p-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black no-blur">Your Portfolio</h3>
                  <Badge className="brand-gradient text-white border-none text-xs">
                    Coming Soon
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="brand-card rounded-lg p-3 border border-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black no-blur">USDC Base Vault</p>
                          <p className="text-xs brand-text font-semibold no-blur">up to 14% APY</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-black no-blur">₹12,00,000</p>
                        <p className="text-xs brand-text font-semibold no-blur">+₹1,44,000</p>
                      </div>
                    </div>
                  </div>

                  <div className="brand-card rounded-lg p-3 border border-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black no-blur">Other Chains</p>
                          <p className="text-xs brand-text font-semibold no-blur">Coming Soon</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-black no-blur">-</p>
                        <p className="text-xs brand-text font-semibold no-blur">Available Later</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="brand-card rounded-lg p-3 bg-primary/5 border border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 brand-text" />
                      <span className="text-sm font-semibold text-black no-blur">Total Earnings</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-black no-blur">₹12,000</p>
                      <p className="text-xs brand-text font-semibold no-blur">This month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}