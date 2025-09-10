
import { useState } from "react";
import { AlertTriangle, Lock, Calendar, DollarSign, Info, Shield, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";

interface YieldLockInTermsProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  lockPeriod: string;
  apy: number;
  depositAmount: string;
}

export default function YieldLockInTerms({ 
  isOpen, 
  onAccept, 
  onDecline, 
  lockPeriod, 
  apy, 
  depositAmount 
}: YieldLockInTermsProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);

  if (!isOpen) return null;

  const calculateUnlockDate = () => {
    if (lockPeriod === "0") return "Anytime (Flexible)";
    const months = parseInt(lockPeriod);
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + months);
    return unlockDate.toLocaleDateString();
  };

  const calculateTotalEarnings = () => {
    if (!depositAmount || lockPeriod === "0") return "0.00";
    const amount = parseFloat(depositAmount);
    const earnings = (amount * apy / 100) * (parseInt(lockPeriod) / 12);
    return earnings.toFixed(2);
  };

  const isFormValid = hasReadTerms && acknowledgeRisks;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto brand-card">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <Lock className="w-6 h-6 text-[#6667AB]" />
              <CardTitle className="text-2xl font-bold text-black">Yield Lock-In Terms & Conditions</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onDecline} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Deposit Summary */}
          <div className="bg-[#6667AB]/5 border-2 border-[#6667AB]/20 rounded-xl p-4">
            <h3 className="font-semibold text-black mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-[#6667AB]" />
              Your Deposit Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#6667AB] font-medium">Amount:</span>
                <p className="font-bold text-black">${depositAmount} USDC</p>
              </div>
              <div>
                <span className="text-[#6667AB] font-medium">Lock Period:</span>
                <p className="font-bold text-black">{lockPeriod === "0" ? "Flexible" : `${lockPeriod} Months`}</p>
              </div>
              <div>
                <span className="text-[#6667AB] font-medium">APY:</span>
                <p className="font-bold text-green-600">{apy}%</p>
              </div>
              <div>
                <span className="text-[#6667AB] font-medium">Est. Earnings:</span>
                <p className="font-bold text-green-600">${calculateTotalEarnings()} USDC</p>
              </div>
            </div>
          </div>

          {/* Key Terms */}
          <div className="space-y-4">
            <h3 className="font-semibold text-black text-lg flex items-center">
              <Shield className="w-5 h-5 mr-2 text-[#6667AB]" />
              Key Terms & Conditions
            </h3>

            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-[#6667AB] pl-4">
                <h4 className="font-semibold text-black mb-2">1. Lock-In Period</h4>
                <p className="text-gray-700">
                  Your deposit will be locked until <strong>{calculateUnlockDate()}</strong>. 
                  {lockPeriod !== "0" ? " Early withdrawal is not permitted during this period." : " You can withdraw anytime with flexible terms."}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-black mb-2">2. Yield Calculation</h4>
                <p className="text-gray-700">
                  Your yield is calculated at <strong>{apy}% APY</strong> and will be distributed based on your lock period. 
                  The total estimated earnings of <strong>${calculateTotalEarnings()} USDC</strong> assumes the full lock period is completed.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-black mb-2">3. Risk Disclosure</h4>
                <p className="text-gray-700">
                  • Cryptocurrency investments carry inherent risks including market volatility<br/>
                  • Past performance does not guarantee future results<br/>
                  • USDC value may fluctuate against fiat currencies<br/>
                  • Smart contract risks and technical failures are possible
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-black mb-2">4. Early Withdrawal Policy</h4>
                <p className="text-gray-700">
                  {lockPeriod !== "0" ? (
                    <>Early withdrawal before unlock date is <strong>not permitted</strong>. 
                    Your funds will remain locked until the specified unlock date.</>
                  ) : (
                    <>With flexible terms, you can withdraw your principal at any time. 
                    However, yield calculations are prorated based on the time held.</>
                  )}
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-black mb-2">5. Platform Terms</h4>
                <p className="text-gray-700">
                  • StablePay operates as a DeFi yield farming platform<br/>
                  • All transactions are recorded on the blockchain<br/>
                  • Gas fees are the responsibility of the user<br/>
                  • Platform may update terms with advance notice
                </p>
              </div>
            </div>
          </div>

          {/* Risk Alerts */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> This is a decentralized finance (DeFi) product. 
              Please ensure you understand the risks before proceeding. Only invest what you can afford to lose.
            </AlertDescription>
          </Alert>

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="read-terms" 
                checked={hasReadTerms}
                onCheckedChange={(checked) => setHasReadTerms(checked === true)}
              />
              <label htmlFor="read-terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                I have read and understood all the terms and conditions above, 
                including the lock-in period of <strong>{lockPeriod === "0" ? "flexible withdrawal" : `${lockPeriod} months`}</strong> 
                and the associated yield calculation.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="acknowledge-risks" 
                checked={acknowledgeRisks}
                onCheckedChange={(checked) => setAcknowledgeRisks(checked === true)}
              />
              <label htmlFor="acknowledge-risks" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                I acknowledge the risks associated with DeFi investments and understand that 
                my deposit of <strong>${depositAmount} USDC</strong> is subject to market risks, 
                smart contract risks, and potential loss of principal.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onDecline}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel Deposit
            </Button>
            <Button 
              onClick={onAccept}
              disabled={!isFormValid}
              className="flex-1 bg-[#6667AB] hover:bg-[#6667AB]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Terms & Proceed with Deposit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
