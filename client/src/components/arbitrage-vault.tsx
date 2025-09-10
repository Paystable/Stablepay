import { 
  TrendingUp, 
  Shield, 
  Globe,
  Clock
} from "lucide-react";

export default function ArbitrageVault() {

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Arbitrage",
      description: "AI-powered algorithms identify and execute profitable opportunities across 20+ exchanges instantly."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced hedging strategies minimize risk exposure through diversified trading approaches."
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access arbitrage opportunities across international exchanges for maximum profit potential."
    },
    {
      icon: Clock,
      title: "24/7 Operations",
      description: "Automated systems work continuously to capture arbitrage opportunities while you sleep."
    }
  ];

  return (
    <section id="arbitrage" className="py-24 brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">

          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 no-blur">
            USDC Arbitrage Vault
          </h2>
          <p className="text-lg sm:text-xl brand-text max-w-3xl mx-auto no-blur">
            Earn up to 14% APY through automated arbitrage strategies on Base network with flexible lock-in periods.
          </p>
        </div>



        {/* How It Works */}
        <div className="brand-card rounded-3xl p-12 shadow-2xl border border-primary/20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black mb-4 no-blur">How Arbitrage Works</h3>
            <p className="text-lg brand-text max-w-2xl mx-auto no-blur">
              Our sophisticated algorithms continuously monitor price differences across global exchanges 
              to generate consistent returns with minimal risk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-bold text-black mb-3 no-blur">{feature.title}</h4>
                <p className="brand-text text-sm leading-relaxed no-blur">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}