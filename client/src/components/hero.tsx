import { memo } from "react";
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
        title: "Every Rupee Counts",
        description: "What you send is what your family receives. Zero fees, always."
    },
    {
        icon: Shield,
        title: "Full Control",
        description: "Your money stays in your wallet. You decide, every step of the way."
    },
    {
        icon: Award,
        title: "More Than Just Sending",
        description: "Your transfers earn up to 14% APY, helping you grow wealth while supporting loved ones."
    },
    {
        icon: Clock,
        title: "Simple & Instant",
        description: "Easy to use, lightning-fast, and built for peace of mind."
    },
];

const Hero = memo(function Hero() {
  return (
    <section className="pt-6 sm:pt-8 md:pt-12 pb-6 sm:pb-8 md:pb-12 brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-black leading-tight no-blur px-1">
                <span className="block sm:inline">Send Money Smarter.</span>{" "}
                <span className="brand-text block sm:inline mt-1 sm:mt-0">Earn While You Transfer.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl brand-text leading-relaxed max-w-2xl no-blur px-1">
                With Stable Pay, every remittance works harder for you.
                No fees. No middlemen. Just fast, secure transfers — and up to 14% annual returns while your money moves.
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-white/90 backdrop-blur-sm rounded-xl border border-[#6667AB]/20 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#6667AB] rounded-lg flex items-center justify-center flex-shrink-0">
                    <indicator.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-black text-base sm:text-lg no-blur leading-tight mb-1">{indicator.title}</h4>
                    <p className="text-sm sm:text-base text-[#6667AB] no-blur leading-relaxed">{indicator.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 sm:pt-4">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-black text-center no-blur px-2 leading-relaxed">
                Stable Pay isn't just about sending money — it's about building a stronger future, together.
              </p>
            </div>

            <div className="pt-6 sm:pt-8">
              <EarlyAccessButton />
              {/* Hidden wallet connection for future use */}
              <div className="hidden">
                <WalletConnection />
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative mt-8 lg:mt-0">
            <div className="brand-card rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-black no-blur">Your Portfolio</h3>
                  <Badge className="brand-gradient text-white border-none text-xs sm:text-sm px-2 py-1">
                    Coming Soon
                  </Badge>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="brand-card rounded-lg p-4 sm:p-5 border border-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 brand-gradient rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-black no-blur">USDC Base Vault</p>
                          <p className="text-xs sm:text-sm brand-text font-semibold no-blur">up to 14% APY</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-black no-blur">₹12,00,000</p>
                        <p className="text-xs sm:text-sm brand-text font-semibold no-blur">+₹1,44,000</p>
                      </div>
                    </div>
                  </div>

                  <div className="brand-card rounded-lg p-4 sm:p-5 border border-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 brand-gradient rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-black no-blur">Other Chains</p>
                          <p className="text-xs sm:text-sm brand-text font-semibold no-blur">Coming Soon</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-bold text-black no-blur">-</p>
                        <p className="text-xs sm:text-sm brand-text font-semibold no-blur">Available Later</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="brand-card rounded-lg p-4 sm:p-5 bg-primary/5 border border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 brand-text" />
                      <span className="text-sm sm:text-base font-semibold text-black no-blur">Total Earnings</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg sm:text-xl font-bold text-black no-blur">₹12,000</p>
                      <p className="text-xs sm:text-sm brand-text font-semibold no-blur">This month</p>
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
});

export default Hero;