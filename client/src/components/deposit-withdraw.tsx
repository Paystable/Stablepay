import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { 
  ArrowDown, 
  Shield, 
  CheckCircle, 
  Clock,
  Coins,
  Calendar,
  RefreshCw,
  Lock,
  Send,
  Loader2,
  Copy,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import YieldLockInTerms from "./yield-lockin-terms";
import YieldLockInAlert from "./yield-lockin-alert";

// StablePay vault address (fixed and non-editable)
const STABLEPAY_VAULT_ADDRESS = "0x4bc7a35d6e09d102087ed84445137f04540a8790";
const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

// Lock period options with APY simulation
const LOCK_PERIODS = [
  { value: "0", label: "No Lock (Flexible)", apy: 7 },
  { value: "1", label: "1 Month", apy: 8 },
  { value: "2", label: "2 Months", apy: 8.5 },
  { value: "3", label: "3 Months", apy: 9 },
  { value: "4", label: "4 Months", apy: 9.5 },
  { value: "5", label: "5 Months", apy: 10 },
  { value: "6", label: "6 Months", apy: 10.5 },
  { value: "7", label: "7 Months", apy: 11 },
  { value: "8", label: "8 Months", apy: 11.5 },
  { value: "9", label: "9 Months", apy: 12 },
  { value: "10", label: "10 Months", apy: 12.5 },
  { value: "11", label: "11 Months", apy: 13 },
  { value: "12", label: "12 Months", apy: 14 },
];

// USDC Transfer ABI
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

interface DepositRecord {
  amount: number;
  lockMonths: number;
  depositTime: Date;
  unlockTime: Date;
  transactionHash: string;
}

export default function DepositWithdraw() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedLockPeriod, setSelectedLockPeriod] = useState("6");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [totalDepositBalance, setTotalDepositBalance] = useState(0);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showLockInAlert, setShowLockInAlert] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: USDC_CONTRACT_ADDRESS as `0x${string}`,
  });

  // Smart contract write hook for USDC transfer
  const { writeContract, isPending: isSending, data: sendHash } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailed } = useWaitForTransactionReceipt({
    hash: sendHash,
  });

  // Load deposits from localStorage
  useEffect(() => {
    if (address) {
      const storedDeposits = localStorage.getItem(`stablepay_deposits_${address}`);
      if (storedDeposits) {
        const parsedDeposits = JSON.parse(storedDeposits).map((d: any) => ({
          ...d,
          depositTime: new Date(d.depositTime),
          unlockTime: new Date(d.unlockTime)
        }));
        setDeposits(parsedDeposits);
        setTotalDepositBalance(parsedDeposits.reduce((sum: number, d: any) => sum + d.amount, 0));
      }
    }
  }, [address]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && sendHash) {
      // Add the deposit to local storage
      const newDeposit: DepositRecord = {
        amount: parseFloat(depositAmount),
        lockMonths: parseInt(selectedLockPeriod),
        depositTime: new Date(),
        unlockTime: new Date(Date.now() + parseInt(selectedLockPeriod) * 30 * 24 * 60 * 60 * 1000),
        transactionHash: sendHash
      };
      
      const updatedDeposits = [...deposits, newDeposit];
      setDeposits(updatedDeposits);
      setTotalDepositBalance(prev => prev + newDeposit.amount);
      
      // Save to localStorage
      if (address) {
        localStorage.setItem(`stablepay_deposits_${address}`, JSON.stringify(updatedDeposits));
      }
      
      // Reset form
      setDepositAmount("");
      setSelectedLockPeriod("6");
      refetchBalance();
    }
  }, [isConfirmed, sendHash, depositAmount, selectedLockPeriod, deposits, address, refetchBalance]);

  const formatUSDCBalance = (balance: any) => {
    if (!balance) return '0.00';
    return Number(formatUnits(balance.value, 6)).toFixed(2);
  };

  const getSelectedAPY = () => {
    const period = LOCK_PERIODS.find(p => p.value === selectedLockPeriod);
    return period ? period.apy : 12;
  };

  const calculateUnlockDate = () => {
    if (!selectedLockPeriod || selectedLockPeriod === "0") return "Anytime (Flexible)";

    const months = parseInt(selectedLockPeriod);
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + months);
    return unlockDate.toLocaleDateString();
  };

  const calculatePayoutDates = () => {
    if (!depositAmount || !selectedLockPeriod) return [];

    const amount = parseFloat(depositAmount);
    const apy = getSelectedAPY();
    const monthlyReturn = (amount * apy / 100) / 12;

    const payouts: Array<{ month: number; date: string; amount: string }> = [];
    for (let i = 1; i <= parseInt(selectedLockPeriod || "1"); i++) {
      const payoutDate = new Date();
      payoutDate.setMonth(payoutDate.getMonth() + i);
      payouts.push({
        month: i,
        date: payoutDate.toLocaleDateString(),
        amount: monthlyReturn.toFixed(2)
      });
    }

    return payouts.slice(0, 6); // Show first 6 months
  };

  const handleSendToVault = async () => {
    if (!depositAmount || !address) return;

    // Show terms and conditions dialog first
    if (!termsAccepted) {
      setShowTermsDialog(true);
      return;
    }

    try {
      const amount = parseUnits(depositAmount, 6); // USDC has 6 decimals

      console.log("=== Sending USDC to StablePay Vault ===");
      console.log("Vault Address:", STABLEPAY_VAULT_ADDRESS);
      console.log("Amount:", depositAmount, "USDC");
      console.log("Lock Period:", selectedLockPeriod, "months");

      // Validate amount is positive
      if (amount <= BigInt(0)) {
        alert('Please enter a valid amount greater than 0.');
        return;
      }

      // Check if user has sufficient balance
      if (usdcBalance && amount > usdcBalance.value) {
        alert('Insufficient USDC balance for this transfer.');
        return;
      }

      writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [STABLEPAY_VAULT_ADDRESS as `0x${string}`, amount],
        gas: BigInt(300000), // Gas limit for USDC transfers
      });
    } catch (error: any) {
      console.error('Send to vault failed:', error);

      if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds') || error?.message?.includes('insufficient balance')) {
        alert('Insufficient USDC balance for this transfer.');
      } else {
        alert(`Transfer failed: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTermsDialog(false);
    setShowLockInAlert(true);
    // Proceed with the actual transaction
    setTimeout(() => {
      handleSendToVault();
    }, 100);
  };

  const handleTermsDecline = () => {
    setShowTermsDialog(false);
    setTermsAccepted(false);
  };

  const copyVaultAddress = async () => {
    await navigator.clipboard.writeText(STABLEPAY_VAULT_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getLatestDeposit = () => {
    return deposits.length > 0 ? deposits[0] : null;
  };

  if (!isConnected) {
    return (
      <section className="py-16 brand-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 brand-text mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-black mb-4 no-blur">Connect Your Wallet</h2>
            <p className="text-lg brand-text no-blur">Please connect your wallet to access deposit features.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 brand-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Deposit Balance Display */}
        {totalDepositBalance > 0 && (
          <div className="brand-card rounded-3xl p-8 mb-8 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-black mb-2 no-blur">Your StablePay Balance</h3>
              <div className="text-4xl font-bold text-green-600 mb-4 no-blur">
                ${totalDepositBalance.toFixed(2)} USDC
              </div>

              {getLatestDeposit() && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <Lock className="w-6 h-6 brand-text mx-auto mb-2" />
                    <div className="text-sm brand-text font-semibold no-blur">Latest Lock Period</div>
                    <div className="text-lg font-bold text-black no-blur">
                      {getLatestDeposit()!.lockMonths === 0 ? "Flexible" : `${getLatestDeposit()!.lockMonths} Months`}
                    </div>
                  </div>

                  <div className="text-center">
                    <Calendar className="w-6 h-6 brand-text mx-auto mb-2" />
                    <div className="text-sm brand-text font-semibold no-blur">Latest Unlock Date</div>
                    <div className="text-lg font-bold text-black no-blur">
                      {getLatestDeposit()!.lockMonths === 0 
                        ? "Anytime" 
                        : getLatestDeposit()!.unlockTime.toLocaleDateString()
                      }
                    </div>
                  </div>

                  <div className="text-center">
                    <Coins className="w-6 h-6 brand-text mx-auto mb-2" />
                    <div className="text-sm brand-text font-semibold no-blur">Total Deposits</div>
                    <div className="text-lg font-bold text-green-600 no-blur">
                      {deposits.length} Transaction{deposits.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchBalance()}
                className="mt-4 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Balance
              </Button>
            </div>
          </div>
        )}

        {/* Deposit Form */}
        <Card className="brand-card rounded-3xl shadow-xl border-2 border-[#6667AB]/20">
          <CardContent className="p-6 lg:p-8 space-y-6">

            

            {/* Available Balance */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm brand-text font-semibold no-blur">Available USDC:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-black no-blur">{formatUSDCBalance(usdcBalance)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchBalance()}
                    className="h-6 w-6 p-0 text-[#6667AB] hover:text-[#6667AB]/80"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-3">
              <Label className="text-black font-semibold">Amount to Deposit (USDC)</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount to deposit"
                className="h-14 text-lg rounded-xl border-2 border-[#6667AB]/30 focus:border-[#6667AB]"
                max={formatUSDCBalance(usdcBalance)}
              />
              <div className="flex justify-between items-center text-sm">
                <span className="brand-text no-blur">Minimum: 1 USDC</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDepositAmount(formatUSDCBalance(usdcBalance))}
                  className="text-[#6667AB] hover:text-[#6667AB]/80 h-auto p-1 text-xs"
                  disabled={!usdcBalance || Number(formatUSDCBalance(usdcBalance)) === 0}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Lock Period */}
            <div className="space-y-3">
              <Label className="text-black font-semibold">Lock Period (for yield calculation)</Label>
              <Select value={selectedLockPeriod} onValueChange={setSelectedLockPeriod}>
                <SelectTrigger className="h-14 rounded-xl border-2 border-[#6667AB]/30 focus:border-[#6667AB] bg-white hover:bg-gray-50 transition-colors">
                  <SelectValue className="text-left">
                    {selectedLockPeriod && (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-black font-medium">
                          {LOCK_PERIODS.find(p => p.value === selectedLockPeriod)?.label}
                        </span>
                        <span className="text-green-600 font-semibold text-sm">
                          {LOCK_PERIODS.find(p => p.value === selectedLockPeriod)?.apy}% APY
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-[#6667AB]/20 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {LOCK_PERIODS.map((period) => (
                    <SelectItem 
                      key={period.value} 
                      value={period.value}
                      className="cursor-pointer hover:bg-[#6667AB]/10 focus:bg-[#6667AB]/10 rounded-lg mx-1 my-1 p-3 border-none data-[highlighted]:bg-[#6667AB]/10"
                    >
                      <div className="flex justify-between items-center w-full min-w-0">
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="text-black font-medium text-sm">{period.label}</span>
                          {period.value === "0" && (
                            <span className="text-[#6667AB] text-xs">Withdraw anytime</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <span className="text-green-600 font-bold text-sm">{period.apy}% APY</span>
                          <span className="text-xs text-[#6667AB]">
                            {period.value === "0" ? "Anytime" : 
                              new Date(Date.now() + parseInt(period.value) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            }
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Yield Lock-In Alert */}
            {depositAmount && selectedLockPeriod && (showLockInAlert || selectedLockPeriod !== "0") && (
              <YieldLockInAlert
                lockPeriod={selectedLockPeriod}
                apy={getSelectedAPY()}
                depositAmount={depositAmount}
                onDismiss={() => setShowLockInAlert(false)}
                showAlways={selectedLockPeriod !== "0"}
              />
            )}

            {/* Deposit Preview */}
            {depositAmount && (
              <div className="bg-[#6667AB]/5 border-2 border-[#6667AB]/20 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-black text-lg no-blur flex items-center">
                  <CheckCircle className="w-5 h-5 text-[#6667AB] mr-2" />
                  Deposit Preview
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-[#6667AB] font-medium no-blur">Deposit Amount:</span>
                    <div className="font-bold text-black text-lg no-blur">${depositAmount} USDC</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#6667AB] font-medium no-blur">Lock Period:</span>
                    <div className="font-bold text-black text-lg no-blur">
                      {selectedLockPeriod === "0" ? "Flexible" : `${selectedLockPeriod} Months`}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#6667AB] font-medium no-blur">Expected APY:</span>
                    <div className="font-bold text-green-600 text-lg no-blur">{getSelectedAPY()}%</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#6667AB] font-medium no-blur">Unlock Date:</span>
                    <div className="font-bold text-black text-lg no-blur">{calculateUnlockDate()}</div>
                  </div>
                </div>

                {/* Total Earnings Display */}
                {selectedLockPeriod !== "0" && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-green-700 font-medium text-sm no-blur">Total Interest Earned:</span>
                        <div className="font-bold text-green-600 text-xl no-blur">
                          ${((parseFloat(depositAmount) * getSelectedAPY() / 100) * (parseInt(selectedLockPeriod) / 12)).toFixed(2)} USDC
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-green-700 font-medium text-sm no-blur">Final Amount:</span>
                        <div className="font-bold text-black text-xl no-blur">
                          ${(parseFloat(depositAmount) + ((parseFloat(depositAmount) * getSelectedAPY() / 100) * (parseInt(selectedLockPeriod) / 12))).toFixed(2)} USDC
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Payout Schedule */}
                {selectedLockPeriod !== "0" && calculatePayoutDates().length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-semibold text-black mb-2 no-blur">Estimated Monthly Payouts:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {calculatePayoutDates().map((payout, index) => (
                        <div key={index} className="bg-white rounded-lg p-2 border">
                          <div className="brand-text no-blur">Month {payout.month}</div>
                          <div className="font-semibold text-green-600 no-blur">+${payout.amount}</div>
                          <div className="text-[10px] brand-text no-blur">{payout.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendToVault}
              disabled={
                !depositAmount || 
                parseFloat(depositAmount) <= 0 || 
                parseFloat(depositAmount) > Number(formatUSDCBalance(usdcBalance)) ||
                isSending ||
                isConfirming
              }
              className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white h-14 text-lg font-semibold rounded-xl"
            >
              {(isSending || isConfirming) ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {isSending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Deposit USDC'}
            </Button>

            {/* Transaction Status */}
            {isConfirmed && sendHash && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 space-y-2">
                  <div>✅ USDC deposited successfully to StablePay vault! Your deposit has been recorded.</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://basescan.org/tx/${sendHash}`, '_blank')}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on BaseScan
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isFailed && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  ❌ Transaction failed. Please check your wallet and try again.
                </AlertDescription>
              </Alert>
            )}

            {(isSending || isConfirming) && (
              <Alert className="border-blue-200 bg-blue-50">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-800">
                  {isSending ? '⏳ Please confirm the transaction in your wallet...' : '🔄 Transaction is being processed...'}
                </AlertDescription>
              </Alert>
            )}

            {/* Important Notice */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> By depositing USDC to our vault address, you're investing in StablePay. 
                Your deposit will be tracked and yield will be calculated based on your selected lock period.
                Only deposit USDC on Base network to this address.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Recent Deposits History */}
        {deposits.length > 0 && (
          <Card className="mt-8 brand-card rounded-3xl shadow-xl border-2 border-[#6667AB]/20">
            <CardHeader className="p-6">
              <CardTitle className="text-xl text-black no-blur">Recent Deposits</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {deposits.slice(0, 5).map((deposit, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-[#6667AB]/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-black no-blur">${deposit.amount.toFixed(2)} USDC</p>
                      <p className="text-sm brand-text no-blur">
                        {deposit.lockMonths === 0 ? "Flexible" : `${deposit.lockMonths} months lock`} • 
                        {deposit.depositTime.toLocaleDateString()}
                      </p>
                      {deposit.transactionHash && (
                        <p className="text-xs text-gray-500 font-mono">
                          {deposit.transactionHash.slice(0, 10)}...{deposit.transactionHash.slice(-8)}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex flex-col space-y-2">
                      <div>
                        <p className="text-sm text-green-600 font-semibold no-blur">
                          {LOCK_PERIODS.find(p => p.value === deposit.lockMonths.toString())?.apy || 12}% APY
                        </p>
                        <p className="text-xs brand-text no-blur">
                          Unlock: {deposit.lockMonths === 0 ? "Anytime" : deposit.unlockTime.toLocaleDateString()}
                        </p>
                      </div>
                      {deposit.transactionHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://basescan.org/tx/${deposit.transactionHash}`, '_blank')}
                          className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          BaseScan
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terms and Conditions Dialog */}
        <YieldLockInTerms
          isOpen={showTermsDialog}
          onAccept={handleTermsAccept}
          onDecline={handleTermsDecline}
          lockPeriod={selectedLockPeriod}
          apy={getSelectedAPY()}
          depositAmount={depositAmount}
        />
      </div>
    </section>
  );
}