
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface KYCStatus {
  status: 'not_started' | 'in_progress' | 'verified' | 'rejected' | 'expired';
  level: 'basic' | 'enhanced' | 'premium';
  confidenceScore: number;
  submittedAt: string;
  verifiedAt?: string;
  expiresAt?: string;
  withdrawalLimit: string;
  steps: {
    personal_info: 'completed' | 'pending' | 'failed';
    document_verification: 'completed' | 'pending' | 'failed';
    digilocker_verification: 'completed' | 'pending' | 'failed';
    face_liveness: 'completed' | 'pending' | 'failed';
    banking_verification: 'completed' | 'pending' | 'failed';
  };
  verificationDetails?: {
    panVerified: boolean;
    aadhaarVerified: boolean;
    bankVerified: boolean;
    faceVerified: boolean;
    nameMatchScore: number;
  };
}

export default function KYCStatusDashboard() {
  const { address } = useAccount();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (address) {
      fetchKYCStatus();
    }
  }, [address]);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch(`/api/kyc/status/${address}`);
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    await fetchKYCStatus();
  };

  const downloadCertificate = () => {
    // Generate and download KYC verification certificate
    const link = document.createElement('a');
    link.href = `/api/kyc/certificate/${address}`;
    link.download = `kyc-certificate-${address}.pdf`;
    link.click();
  };

  const getStatusInfo = (status: KYCStatus['status']) => {
    switch (status) {
      case 'not_started':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          title: 'Not Started',
          description: 'KYC verification has not been initiated'
        };
      case 'in_progress':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          title: 'In Progress',
          description: 'Your KYC verification is being processed'
        };
      case 'verified':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          title: 'Verified',
          description: 'Your account is fully verified'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          title: 'Rejected',
          description: 'Verification failed - please retry'
        };
      case 'expired':
        return {
          color: 'bg-orange-100 text-orange-800',
          icon: AlertTriangle,
          title: 'Expired',
          description: 'Verification has expired - renewal required'
        };
    }
  };

  const getLevelInfo = (level: KYCStatus['level']) => {
    switch (level) {
      case 'basic':
        return {
          color: 'bg-blue-100 text-blue-800',
          title: 'Basic',
          limits: '₹25,000/month'
        };
      case 'enhanced':
        return {
          color: 'bg-orange-100 text-orange-800',
          title: 'Enhanced',
          limits: '₹1,00,000/month'
        };
      case 'premium':
        return {
          color: 'bg-purple-100 text-purple-800',
          title: 'Premium',
          limits: 'Unlimited'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!kycStatus) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-2 border-[#6667AB]/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Start Your KYC Journey</CardTitle>
            <CardDescription className="text-lg">
              Complete your verification to unlock the full potential of StablePay
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-[#6667AB] hover:bg-[#5555AB]" size="lg">
              <Shield className="h-5 w-5 mr-2" />
              Begin KYC Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(kycStatus.status);
  const levelInfo = getLevelInfo(kycStatus.level);
  const StatusIcon = statusInfo.icon;

  const stepStatus = Object.values(kycStatus.steps);
  const completedSteps = stepStatus.filter(status => status === 'completed').length;
  const totalSteps = stepStatus.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#6667AB]/20 bg-gradient-to-r from-[#6667AB]/5 to-[#8B5CF6]/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6667AB] to-[#8B5CF6] rounded-full flex items-center justify-center">
                <StatusIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">KYC Verification Status</CardTitle>
                <CardDescription className="text-lg">
                  Monitor your verification progress and manage your account limits
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB] hover:text-white"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#6667AB]" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge className={statusInfo.color}>
                {statusInfo.title}
              </Badge>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
              {kycStatus.confidenceScore > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Confidence Score</div>
                  <div className="flex items-center gap-2">
                    <Progress value={kycStatus.confidenceScore} className="flex-1" />
                    <span className="text-sm font-medium">{kycStatus.confidenceScore}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-[#6667AB]" />
              Verification Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge className={levelInfo.color}>
                {levelInfo.title}
              </Badge>
              <div className="space-y-1">
                <div className="text-sm font-medium">Withdrawal Limit</div>
                <div className="text-lg font-bold text-[#6667AB]">{levelInfo.limits}</div>
              </div>
              <p className="text-xs text-gray-500">
                Upgrade to Premium for unlimited withdrawals
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#6667AB]" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-[#6667AB]">
                {completedSteps}/{totalSteps}
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {completedSteps} of {totalSteps} steps completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-[#6667AB]" />
            Verification Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(kycStatus.steps).map(([stepKey, status]) => {
              const stepNames: Record<string, string> = {
                personal_info: 'Personal Information',
                document_verification: 'Document Verification',
                digilocker_verification: 'Digilocker Verification',
                face_liveness: 'Face Liveness Check',
                banking_verification: 'Banking Verification'
              };

              const stepIcons: Record<string, React.ComponentType> = {
                personal_info: Users,
                document_verification: Shield,
                digilocker_verification: Shield,
                face_liveness: Eye,
                banking_verification: TrendingUp
              };

              const StepIconComponent = stepIcons[stepKey] as React.ComponentType<{ className?: string }>;
              
              return (
                <div key={stepKey} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      status === 'completed' ? 'bg-green-100 text-green-600' :
                      status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      <StepIconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{stepNames[stepKey]}</div>
                      <div className="text-sm text-gray-600 capitalize">{status}</div>
                    </div>
                  </div>
                  <Badge variant={
                    status === 'completed' ? 'default' :
                    status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Details */}
      {kycStatus.verificationDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#6667AB]" />
              Verification Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">PAN Verified</span>
                <Badge variant={kycStatus.verificationDetails.panVerified ? 'default' : 'secondary'}>
                  {kycStatus.verificationDetails.panVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Aadhaar Verified</span>
                <Badge variant={kycStatus.verificationDetails.aadhaarVerified ? 'default' : 'secondary'}>
                  {kycStatus.verificationDetails.aadhaarVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Bank Verified</span>
                <Badge variant={kycStatus.verificationDetails.bankVerified ? 'default' : 'secondary'}>
                  {kycStatus.verificationDetails.bankVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Face Verified</span>
                <Badge variant={kycStatus.verificationDetails.faceVerified ? 'default' : 'secondary'}>
                  {kycStatus.verificationDetails.faceVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">Name Match Score</span>
                <Badge variant="outline">
                  {kycStatus.verificationDetails.nameMatchScore}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {kycStatus.status === 'verified' && (
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={downloadCertificate}
                variant="outline"
                className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              {kycStatus.level !== 'premium' && (
                <Button className="bg-[#6667AB] hover:bg-[#5555AB]">
                  <Star className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {kycStatus.status === 'rejected' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your KYC verification was rejected. Please review your information and try again.
            If you believe this is an error, please contact our support team.
          </AlertDescription>
        </Alert>
      )}

      {kycStatus.status === 'expired' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your KYC verification has expired. Please complete the verification process again to continue using all features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
