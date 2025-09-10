
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Eye,
  FileText,
  Users,
  TrendingUp,
  Clock,
  Building2,
  Award
} from "lucide-react";

interface SecurityScore {
  score: number;
  factors: {
    smartContractAudit: boolean;
    multiSigWallet: boolean;
    timelock: boolean;
    insurance: boolean;
    compliance: boolean;
  };
}

interface TrustMetrics {
  totalValueLocked: number;
  activeUsers: number;
  auditScore: number;
  insuranceCoverage: number;
  complianceStatus: 'verified' | 'pending' | 'non-compliant';
}

export default function TrustValidation() {
  const { address, isConnected } = useAccount();
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    score: 85,
    factors: {
      smartContractAudit: true,
      multiSigWallet: true,
      timelock: true,
      insurance: false,
      compliance: true
    }
  });

  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics>({
    totalValueLocked: 2450000,
    activeUsers: 1250,
    auditScore: 95,
    insuranceCoverage: 1000000,
    complianceStatus: 'verified'
  });

  const [verificationSteps, setVerificationSteps] = useState([
    {
      id: 'contract_audit',
      title: 'Smart Contract Audit',
      description: 'Independently audited by CertiK',
      status: 'completed',
      link: 'https://certik.com/projects/stablepay'
    },
    {
      id: 'multi_sig',
      title: 'Multi-Signature Security',
      description: '3-of-5 multi-sig wallet protection',
      status: 'completed',
      link: null
    },
    {
      id: 'timelock',
      title: 'Timelock Implementation',
      description: '48-hour delay for critical changes',
      status: 'completed',
      link: null
    },
    {
      id: 'compliance',
      title: 'Regulatory Compliance',
      description: 'FIU(Financial Intelligence Unit)-India Registered, FEMA compliant',
      status: 'completed',
      link: null
    },
    {
      id: 'insurance',
      title: 'Insurance Coverage',
      description: 'Smart contract insurance (Coming Soon)',
      status: 'pending',
      link: null
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card className="bg-white shadow-lg border border-[#6667AB]/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <Shield className="w-6 h-6 mr-2 text-[#6667AB]" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-[#6667AB]">{securityScore.score}/100</div>
              <div className="text-sm text-gray-600">Overall Security Rating</div>
            </div>
            <div className="w-24 h-24">
              <div className="relative w-full h-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#6667AB"
                    strokeWidth="2"
                    strokeDasharray={`${securityScore.score}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#6667AB]">{securityScore.score}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(securityScore.factors).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm capitalize text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-lg border border-[#6667AB]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-black">
                  ${(trustMetrics.totalValueLocked / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">Total Value Locked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border border-[#6667AB]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {trustMetrics.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border border-[#6667AB]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-black">{trustMetrics.auditScore}%</div>
                <div className="text-sm text-gray-600">Audit Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border border-[#6667AB]/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-sm text-gray-600">Compliance</div>
                <Badge 
                  variant={trustMetrics.complianceStatus === 'verified' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {trustMetrics.complianceStatus === 'verified' ? 'FIU(Financial Intelligence Unit)-India Registered Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Steps */}
      <Card className="bg-white shadow-lg border border-[#6667AB]/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
            Security Verification Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationSteps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-black">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.link && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-[#6667AB]"
                    onClick={() => window.open(step.link!, '_blank')}
                  >
                    View Details
                  </Button>
                )}
              </div>
              <Badge 
                variant={step.status === 'completed' ? 'default' : 'secondary'}
                className="ml-auto"
              >
                {step.status === 'completed' ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Warnings */}
      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
            Important Risk Disclosures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Smart Contract Risk:</strong> While audited, smart contracts may contain unknown vulnerabilities.
            </AlertDescription>
          </Alert>
          
          <Alert className="border-blue-200">
            <Eye className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Regulatory Risk:</strong> Cryptocurrency regulations may change. We maintain compliance with current laws.
            </AlertDescription>
          </Alert>
          
          <Alert className="border-purple-200">
            <Lock className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Liquidity Risk:</strong> Funds are locked for the chosen period and cannot be withdrawn early.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Transparency Commitment */}
      <Card className="bg-green-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-black">
            <FileText className="w-6 h-6 mr-2 text-green-600" />
            Transparency Commitment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-black">Open Source</h4>
              <p className="text-sm text-gray-600">
                Our smart contracts are open source and verifiable on Base blockchain.
              </p>
              <Button variant="outline" size="sm">
                View on BaseScan
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-black">Regular Audits</h4>
              <p className="text-sm text-gray-600">
                Quarterly security audits by independent firms to ensure continued safety.
              </p>
              <Button variant="outline" size="sm">
                Audit Reports
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-black">Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">
                24/7 monitoring of contract interactions and security events.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-black">Community Governance</h4>
              <p className="text-sm text-gray-600">
                Major protocol changes require community voting and timelock delays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
