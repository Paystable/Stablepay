
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  Eye,
  Lock,
  TrendingUp,
  Building2
} from "lucide-react";

interface RiskDisclosureProps {
  onAccept: () => void;
  children: React.ReactNode;
}

export default function RiskDisclosure({ onAccept, children }: RiskDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedRisks, setAcceptedRisks] = useState({
    smartContract: false,
    regulatory: false,
    liquidity: false,
    volatility: false,
    general: false
  });

  const allRisksAccepted = Object.values(acceptedRisks).every(Boolean);

  const handleAccept = () => {
    if (allRisksAccepted) {
      onAccept();
      setIsOpen(false);
    }
  };

  const riskCategories = [
    {
      id: 'smartContract',
      title: 'Smart Contract Risk',
      icon: Shield,
      description: 'Smart contracts may contain bugs or vulnerabilities despite auditing.',
      details: [
        'Code audited by CertiK with 95% security score',
        'Timelock implementation for critical changes',
        'Multi-signature wallet protection',
        'Regular security monitoring'
      ]
    },
    {
      id: 'regulatory',
      title: 'Regulatory Risk',
      icon: Building2,
      description: 'Cryptocurrency regulations may change affecting the platform.',
      details: [
        'Currently FIU-IND registered and FEMA compliant',
        'Active monitoring of regulatory changes',
        'Legal compliance team in place',
        'May need to modify services based on new regulations'
      ]
    },
    {
      id: 'liquidity',
      title: 'Liquidity Risk',
      icon: Lock,
      description: 'Funds are locked for the chosen period and cannot be withdrawn early.',
      details: [
        'Lock periods range from 15 days to 12 months',
        'No early withdrawal option available',
        'Higher APY compensates for liquidity restriction',
        'Emergency procedures in extreme circumstances only'
      ]
    },
    {
      id: 'volatility',
      title: 'USDC Stability Risk',
      icon: TrendingUp,
      description: 'While USDC is a stablecoin, it may lose its peg in extreme circumstances.',
      details: [
        'USDC backed by USD reserves (Circle)',
        'Rare depeg events possible during market stress',
        'Platform monitors USDC stability continuously',
        'Diversification recommended for large investments'
      ]
    },
    {
      id: 'general',
      title: 'General Investment Risk',
      icon: AlertTriangle,
      description: 'All investments carry risk and past performance doesn\'t guarantee future returns.',
      details: [
        'APY rates may change based on market conditions',
        'Platform operational risks exist',
        'Technology infrastructure dependencies',
        'Only invest what you can afford to lose'
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl text-black">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            Risk Disclosure & Terms
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> Please read and acknowledge all risks before proceeding. 
              Cryptocurrency investments involve significant risk and may result in loss of funds.
            </AlertDescription>
          </Alert>

          {riskCategories.map((risk) => (
            <div key={risk.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <risk.icon className="w-6 h-6 text-[#6667AB] flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-black text-lg">{risk.title}</h3>
                  <p className="text-gray-600 mb-3">{risk.description}</p>
                  
                  <div className="space-y-2">
                    {risk.details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#6667AB] rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id={risk.id}
                  checked={acceptedRisks[risk.id as keyof typeof acceptedRisks]}
                  onCheckedChange={(checked) => 
                    setAcceptedRisks(prev => ({ ...prev, [risk.id]: checked as boolean }))
                  }
                />
                <label htmlFor={risk.id} className="text-sm text-black font-medium">
                  I understand and acknowledge this risk
                </label>
              </div>
            </div>
          ))}

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-black text-lg mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Our Security Measures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  ✓ Audited
                </Badge>
                <span className="text-sm">CertiK Security Audit</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  ✓ Compliant
                </Badge>
                <span className="text-sm">FIU-IND Registered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  ✓ Secured
                </Badge>
                <span className="text-sm">Multi-Sig Wallet</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  ✓ Transparent
                </Badge>
                <span className="text-sm">Open Source</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              disabled={!allRisksAccepted}
              className="flex-1 bg-[#6667AB] hover:bg-[#6667AB]/90 disabled:opacity-50"
            >
              I Accept All Risks & Proceed
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {!allRisksAccepted && (
            <p className="text-sm text-gray-600 text-center">
              Please acknowledge all risk categories to proceed
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
