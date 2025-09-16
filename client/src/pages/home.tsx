import Navigation from "@/components/navigation";
import Hero from "@/components/hero";
import { TrustBadge } from "@/components/trust-badge";
import Features from "@/components/features";
import ArbitrageVault from "@/components/arbitrage-vault";
import TargetAudiences from "@/components/target-audiences";
import ComparisonTable from "@/components/comparison-table";
import RemittanceCalculator from "@/components/remittance-calculator";
import FinanceCalculator from "@/components/finance-calculator";
import PoolExplorer from "@/components/pool-explorer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navigation />
      <Hero />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <TrustBadge />
        </div>
      </div>
      <RemittanceCalculator />
      <FinanceCalculator />
      <PoolExplorer />
      <Features />
      <ArbitrageVault />
      <TargetAudiences />
      <ComparisonTable />
    </div>
  );
}