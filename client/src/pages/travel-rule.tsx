
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  MapPin,
  Building,
  FileText
} from "lucide-react";
import WalletConnection from "../components/wallet-connection";
import Navigation from "../components/navigation";

interface ComplianceStatus {
  isCompliant: boolean;
  lastUpdated: string | null;
  status: 'pending' | 'completed' | 'expired';
  originatorInfo?: {
    fullName: string;
    country: string;
    completedAt: string;
  };
}

export default function TravelRulePage() {
  const { address, isConnected } = useAccount();
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchComplianceStatus();
    }
  }, [isConnected, address]);

  const fetchComplianceStatus = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/travel-rule/status/${address}`);
      if (response.ok) {
        const data = await response.json();
        setComplianceStatus(data);
      }
    } catch (error) {
      console.error('Error fetching compliance status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white shadow-lg border border-[#6667AB]/20">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-[#6667AB] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-black mb-4">
                Travel Rule Compliance
              </h1>
              <p className="text-[#6667AB] mb-6">
                Connect your wallet to view and manage your compliance status
              </p>
              <WalletConnection />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#6667AB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6667AB]">Loading compliance status...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#FAF9F6] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="w-20 h-20 text-[#6667AB] mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-black mb-4">
              Travel Rule Compliance
            </h1>
            <p className="text-xl text-[#6667AB] max-w-2xl mx-auto">
              Manage your compliance status and originator information for regulatory requirements
            </p>
          </div>

          {/* Compliance Status Overview */}
          <Card className="mb-8 border border-[#6667AB]/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  complianceStatus?.isCompliant ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {complianceStatus?.isCompliant ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-orange-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">
                    Compliance Status
                  </h2>
                  <Badge 
                    variant={complianceStatus?.isCompliant ? 'default' : 'secondary'}
                    className={complianceStatus?.isCompliant ? 'bg-green-600' : 'bg-orange-600'}
                  >
                    {complianceStatus?.isCompliant ? 'Compliant' : 'Pending'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {complianceStatus?.isCompliant ? (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your Travel Rule compliance is up to date. You can perform transactions without restrictions.
                    </AlertDescription>
                  </Alert>
                  
                  {complianceStatus.originatorInfo && (
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-[#6667AB]" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-black">
                            {complianceStatus.originatorInfo.fullName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-[#6667AB]" />
                        <div>
                          <p className="text-sm text-gray-600">Country</p>
                          <p className="font-medium text-black">
                            {complianceStatus.originatorInfo.country}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-[#6667AB]" />
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-medium text-black">
                            {new Date(complianceStatus.originatorInfo.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Travel Rule compliance is required for transactions. Please complete your originator information to proceed.
                    </AlertDescription>
                  </Alert>
                  
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-[#6667AB] hover:bg-[#6667AB]/90 text-white"
                  >
                    Complete Compliance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* What is Travel Rule */}
            <Card className="border border-[#6667AB]/20 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-black">
                  <FileText className="w-6 h-6 text-[#6667AB]" />
                  What is the Travel Rule?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The Travel Rule is a regulatory requirement that mandates financial institutions to collect and share certain customer information for wire transfers and virtual asset transfers above specific thresholds.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Enhances AML/CFT compliance
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Prevents money laundering
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Ensures regulatory compliance
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Required Information */}
            <Card className="border border-[#6667AB]/20 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-black">
                  <Building className="w-6 h-6 text-[#6667AB]" />
                  Required Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  To comply with the Travel Rule, we collect the following originator information:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#6667AB] mt-0.5 flex-shrink-0" />
                    Full legal name and date of birth
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#6667AB] mt-0.5 flex-shrink-0" />
                    Complete residential address
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-[#6667AB] mt-0.5 flex-shrink-0" />
                    Government-issued ID information
                  </li>
                  <li className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-[#6667AB] mt-0.5 flex-shrink-0" />
                    Banking details (optional)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Card className="mt-8 border border-[#6667AB]/20 bg-white shadow-lg">
            <CardContent className="p-6">
              <Alert className="border-[#6667AB]/20 bg-[#6667AB]/5">
                <Shield className="h-4 w-4 text-[#6667AB]" />
                <AlertDescription className="text-[#6667AB]">
                  <strong>Security & Privacy:</strong> All personal information is encrypted and stored securely. We comply with international data protection standards and only use this information for regulatory compliance purposes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
