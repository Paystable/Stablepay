
import { useState, useEffect } from "react";
import { AlertTriangle, Lock, Calendar, X, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

interface YieldLockInAlertProps {
  lockPeriod: string;
  apy: number;
  depositAmount: string;
  onDismiss?: () => void;
  showAlways?: boolean;
}

export default function YieldLockInAlert({ 
  lockPeriod, 
  apy, 
  depositAmount, 
  onDismiss,
  showAlways = false 
}: YieldLockInAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'success'>('info');

  useEffect(() => {
    // Determine alert type based on lock period
    if (lockPeriod === "0") {
      setAlertType('info');
    } else if (parseInt(lockPeriod) >= 6) {
      setAlertType('warning');
    } else {
      setAlertType('success');
    }
  }, [lockPeriod]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const calculateUnlockDate = () => {
    if (lockPeriod === "0") return "anytime";
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

  const getAlertConfig = () => {
    switch (alertType) {
      case 'warning':
        return {
          className: "border-amber-200 bg-amber-50",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
          textColor: "text-amber-800",
          title: "⚠️ Extended Lock-In Period",
          message: `Your deposit will be locked for ${lockPeriod} months until ${calculateUnlockDate()}. Early withdrawal is not possible.`
        };
      case 'success':
        return {
          className: "border-green-200 bg-green-50",
          icon: <Lock className="h-4 w-4 text-green-600" />,
          textColor: "text-green-800",
          title: "✅ Yield Lock-In Active",
          message: `Your ${depositAmount} USDC deposit is locked for ${lockPeriod} months, earning ${apy}% APY.`
        };
      default:
        return {
          className: "border-blue-200 bg-blue-50",
          icon: <Info className="h-4 w-4 text-blue-600" />,
          textColor: "text-blue-800",
          title: "💡 Flexible Deposit Terms",
          message: `Your ${depositAmount} USDC deposit has flexible terms. You can withdraw anytime.`
        };
    }
  };

  if (!isVisible && !showAlways) return null;

  const alertConfig = getAlertConfig();

  return (
    <div className="mb-4">
      <Alert className={alertConfig.className}>
        {alertConfig.icon}
        <AlertDescription className={`${alertConfig.textColor} space-y-2`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-semibold mb-1">{alertConfig.title}</div>
              <div className="text-sm mb-2">{alertConfig.message}</div>
              
              {lockPeriod !== "0" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white/50 rounded-lg p-3 mt-2">
                  <div>
                    <span className="font-medium">Unlock Date:</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {calculateUnlockDate()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Expected Earnings:</span>
                    <div className="font-bold text-green-600 mt-1">
                      +${calculateTotalEarnings()} USDC
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">APY:</span>
                    <div className="font-bold mt-1">{apy}%</div>
                  </div>
                </div>
              )}

              {lockPeriod !== "0" && (
                <div className="text-xs mt-2 font-medium">
                  📍 Remember: Early withdrawal is not permitted during the lock period.
                </div>
              )}
            </div>

            {!showAlways && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
