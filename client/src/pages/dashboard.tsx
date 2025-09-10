import Navigation from "@/components/navigation";
import Dashboard from "@/components/dashboard";
import DepositWithdraw from "@/components/deposit-withdraw";
import PoolExplorer from '../components/pool-explorer';
import CopyWalletAddress from '../components/copy-wallet-address';
import { VaultEvents } from '../components/vault-events';

export default function DashboardPage() {

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navigation />
      <Dashboard />
    </div>
  );
}