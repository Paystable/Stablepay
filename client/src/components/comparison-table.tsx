import { Badge } from "./ui/badge";
import { CheckCircle, X, TrendingUp } from "lucide-react";

export default function ComparisonTable() {
  const comparisonData = [
    {
      feature: "Returns (APY)",
      stablePay: "up to 14%",
      traditionalBanks: "3%",
      mutualFunds: "8-12%",
      realEstate: "6-8%",
      stablePayBest: true
    },
    {
      feature: "Liquidity",
      stablePay: "Instant",
      traditionalBanks: "Instant",
      mutualFunds: "1-3 days",
      realEstate: "Months",
      stablePayBest: true
    },
    {
      feature: "Minimum Investment",
      stablePay: "₹1,000",
      traditionalBanks: "₹10,000",
      mutualFunds: "₹500",
      realEstate: "₹25L+",
      stablePayBest: true
    },
    {
      feature: "Risk Level",
      stablePay: "Very Low",
      traditionalBanks: "Low",
      mutualFunds: "Medium",
      realEstate: "High",
      stablePayBest: true
    },
    {
      feature: "Tax Efficiency",
      stablePay: "Optimized",
      traditionalBanks: "Taxable",
      mutualFunds: "LTCG Benefits",
      realEstate: "Depreciation",
      stablePayBest: true
    }
  ];

  return (
    <section id="comparison" className="py-24 brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">

          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 no-blur">
            How Stable Pay Compares
          </h2>
          <p className="text-lg sm:text-xl brand-text max-w-3xl mx-auto no-blur">
            See how our crypto arbitrage platform stacks up against traditional investment options in India.
          </p>
        </div>

        <div className="brand-card rounded-3xl shadow-2xl overflow-hidden border border-primary/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="brand-gradient text-white">
                <tr>
                  <th className="text-left py-6 px-6 font-bold text-lg">Features</th>
                  <th className="text-center py-6 px-6 font-bold text-lg">Stable Pay</th>
                  <th className="text-center py-6 px-6 font-bold text-lg">Traditional Banks</th>
                  <th className="text-center py-6 px-6 font-bold text-lg">Mutual Funds</th>
                  <th className="text-center py-6 px-6 font-bold text-lg">Real Estate</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                    <td className="py-6 px-6 font-semibold text-black no-blur">{row.feature}</td>
                    <td className="py-6 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.stablePayBest && <CheckCircle className="w-5 h-5 text-green-600" />}
                        <span className={`font-bold ${row.stablePayBest ? 'brand-text' : 'text-black'} no-blur`}>
                          {row.stablePay}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center font-semibold text-gray-600 no-blur">
                      {row.traditionalBanks}
                    </td>
                    <td className="py-6 px-6 text-center font-semibold text-gray-600 no-blur">
                      {row.mutualFunds}
                    </td>
                    <td className="py-6 px-6 text-center font-semibold text-gray-600 no-blur">
                      {row.realEstate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-primary/5 p-8 text-center border-t border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-bold text-black no-blur">Best-in-class features highlighted</span>
            </div>
            <p className="brand-text max-w-2xl mx-auto no-blur">
              Stable Pay combines the security of traditional banking with the high yields of alternative investments, 
              all while maintaining regulatory compliance and instant liquidity.
            </p>
          </div>
        </div>


      </div>
    </section>
  );
}