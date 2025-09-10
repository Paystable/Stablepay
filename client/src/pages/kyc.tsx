
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import KYCVerificationSuite from '../components/kyc-verification-suite';
import KYCStatusDashboard from '../components/kyc-status-dashboard';
import WalletConnection from '../components/wallet-connection';
import { Shield, Eye, FileText } from 'lucide-react';

export default function KYCPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('verify');

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              StablePay KYC Center
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Complete your identity verification to unlock seamless crypto-to-INR transfers
            </p>
          </div>
          <WalletConnection />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StablePay KYC Center
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Complete your identity verification to unlock seamless crypto-to-INR transfers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="verify" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verify Identity
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verify" className="space-y-6">
            <KYCVerificationSuite />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <KYCStatusDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
