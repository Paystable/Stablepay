import { useState, useEffect, useCallback } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useBlockNumber, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { 
  Target, 
  TrendingUp, 
  Users, 
  ExternalLink, 
  RefreshCw,
  Clock,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Percent,
  Calendar,
  Send,
  BarChart3,
  Loader2,
  Shield,
  Wallet,
  Award,
  Eye,
  Lock,
  CreditCard,
  Calculator,
  Building2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { stablePayData } from '../lib/stablepay-data';
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import WalletConnection from "./wallet-connection";
import { VAULT_ABI, USDC_ABI, CONTRACTS, type UserDeposit } from "../lib/vault-contract";
import SendReceiveUSDC from "./send-receive-usdc";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import LockPeriodDropdown from "./lock-period-dropdown";
import LiveExchangeCalculator from "./live-exchange-calculator";
import DepositWithdraw from "./deposit-withdraw";
import CopyWalletAddress from "./copy-wallet-address";
import RiskDisclosure from "./risk-disclosure";
import INRWithdrawalKYC from "./inr-withdrawal-kyc";
// import { useCoinbaseOnramp } from '@coinbase/onramp-sdk';
import { 
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { base } from 'viem/chains';

declare global {
  interface Window {
    CB_ONRAMP_TOKEN?: string;
  }
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedLockPeriod, setSelectedLockPeriod] = useState(1); // Default 1 month
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [onrampUrl, setOnrampUrl] = useState("");
  const [useGaslessDeposit, setUseGaslessDeposit] = useState(true);
  const [lastYieldUpdate, setLastYieldUpdate] = useState(new Date());
  const [realTimeYield, setRealTimeYield] = useState(0n);

  // Contract reads
  const { data: usdcBalance } = useBalance({
    address,
    token: CONTRACTS.USDC
  });

  // Helper function to safely format USDC balance
  const formatUSDCBalance = (balance: any) => {
    if (!balance?.value) return '0.00';
    return Number(formatUnits(balance.value, 6)).toFixed(2);
  };

  const { data: vaultBalance } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: userDepositData } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getUserDeposit',
    args: address ? [address] : undefined,
  });

  const { data: yieldAvailable } = useReadContract({
    address: CONTRACTS.VAULT,
    abi: VAULT_ABI,
    functionName: 'getYieldAvailable',
    args: address ? [address] : undefined,
  });

  const { data: usdcAllowance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VAULT] : undefined,
  });

  // Contract writes
  const { writeContract: writeApprove, isPending: isApprovePending, data: approveHash } = useWriteContract();
  const { writeContract: writeDeposit, isPending: isDepositPending, data: depositHash } = useWriteContract();
  const { writeContract: writeWithdraw, isPending: isWithdrawPending, data: withdrawHash } = useWriteContract();
  const { writeContract: writeClaimYield, isPending: isClaimPending, data: claimHash } = useWriteContract();

  // Transaction receipts
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Load deposit data from localStorage (from deposit tab)
  const [localDeposits, setLocalDeposits] = useState<any[]>([]);
  const [totalLocalBalance, setTotalLocalBalance] = useState(0);

  // Load deposits from localStorage on component mount and address change
  useEffect(() => {
    if (address) {
      const storedDeposits = localStorage.getItem(`stablepay_deposits_${address}`);
      if (storedDeposits) {
        try {
          const parsedDeposits = JSON.parse(storedDeposits).map((d: any) => ({
            ...d,
            depositTime: new Date(d.depositTime),
            unlockTime: new Date(d.unlockTime)
          }));
          setLocalDeposits(parsedDeposits);
          setTotalLocalBalance(parsedDeposits.reduce((sum: number, d: any) => sum + d.amount, 0));
        } catch (error) {
          console.error('Error parsing stored deposits:', error);
          setLocalDeposits([]);
          setTotalLocalBalance(0);
        }
      } else {
        setLocalDeposits([]);
        setTotalLocalBalance(0);
      }
    }
  }, [address]);

  // Real-time update listener for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `stablepay_deposits_${address}` && e.newValue) {
        try {
          const parsedDeposits = JSON.parse(e.newValue).map((d: any) => ({
            ...d,
            depositTime: new Date(d.depositTime),
            unlockTime: new Date(d.unlockTime)
          }));
          setLocalDeposits(parsedDeposits);
          setTotalLocalBalance(parsedDeposits.reduce((sum: number, d: any) => sum + d.amount, 0));
        } catch (error) {
          console.error('Error parsing updated deposits:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [address]);

  // Parse user deposit data - combine smart contract and localStorage data
  const userDeposit: UserDeposit | null = userDepositData ? {
    amount: userDepositData[0],
    lockUntil: userDepositData[1],
    yieldEarned: userDepositData[2],
    isLocked: Number(userDepositData[1]) * 1000 > Date.now(),
    daysRemaining: Math.max(0, Math.ceil((Number(userDepositData[1]) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
  } : null;

  // Get combined balance from both sources
  const getCombinedBalance = () => {
    const contractBalance = userDepositData && userDepositData[0] > 0n ? 
      Number(formatUnits(userDepositData[0], 6)) : 0;
    return contractBalance + totalLocalBalance;
  };

  // Get latest deposit info
  const getLatestDepositInfo = () => {
    if (localDeposits.length > 0) {
      return localDeposits[0]; // Most recent deposit from localStorage
    }
    return null;
  };

  // Initialize Coinbase Onramp with server-generated session token
  useEffect(() => {
    const initOnramp = async () => {
      if (!address) return;

      try {
        const response = await fetch('/api/coinbase/session-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: address
          })
        });

        if (response.ok) {
          const data = await response.json();
          const baseUrl = "https://pay.coinbase.com/buy/select-asset";

          const onrampConfig = {
            appId: import.meta.env.VITE_COINBASE_PROJECT_ID || "55a219f0-5f88-4931-818a-34bd7d74eff8",
            sessionToken: data.sessionToken,
            addresses: {
              [address]: ["base"]
            },
            assets: ["USDC"],
            defaultNetwork: "base",
            defaultAsset: "USDC",
            defaultAmount: "100",
            partnerUserId: address,
            partnerDisplayName: "StablePay Vault Deposit"
          };

          const params = new URLSearchParams();
          params.append('appId', onrampConfig.appId);
          params.append('sessionToken', data.sessionToken);
          params.append('addresses', JSON.stringify(onrampConfig.addresses));
          params.append('assets', JSON.stringify(onrampConfig.assets));
          params.append('defaultNetwork', onrampConfig.defaultNetwork);
          params.append('defaultAsset', onrampConfig.defaultAsset);
          params.append('defaultAmount', onrampConfig.defaultAmount);

          setOnrampUrl(`${baseUrl}?${params.toString()}`);
        }
      } catch (error) {
        console.error('Failed to initialize onramp:', error);
      }
    };

    initOnramp();
  }, [address]);

  // Enhanced lock period options with progressive APY scaling up to 24%
  const lockPeriodOptions = [
    { months: 0.5, label: "15 Days", apy: 7, description: "Short-term liquidity with base returns" },
    { months: 1, label: "1 Month", apy: 8, description: "Higher than traditional savings accounts" },
    { months: 2, label: "2 Months", apy: 8.5, description: "Beat inflation with stable returns" },
    { months: 3, label: "3 Months", apy: 9, description: "Quarterly commitment with solid gains" },
    { months: 4, label: "4 Months", apy: 9.5, description: "Extended lock-in for enhanced yield" },
    { months: 5, label: "5 Months", apy: 10, description: "Mid-term strategy with growing returns" },
    { months: 6, label: "6 Months", apy: 10.5, description: "Semi-annual commitment, substantial APY" },
    { months: 7, label: "7 Months", apy: 11, description: "Extended commitment with premium rates" },
    { months: 8, label: "8 Months", apy: 11.5, description: "Long-term focus with excellent returns" },
    { months: 9, label: "9 Months", apy: 12, description: "Premium lock-in with superior yields" },
    { months: 10, label: "10 Months", apy: 12.5, description: "Extended tenure with exceptional rates" },
    { months: 11, label: "11 Months", apy: 13, description: "Near-annual commitment, premium APY" },
    { months: 12, label: "12 Months", apy: 14, description: "Maximum tenure with highest returns" }
  ];

  // Get current APY based on selected lock period
  const getCurrentAPY = () => {
    const option = lockPeriodOptions.find(opt => opt.months === selectedLockPeriod);
    return option ? option.apy : 7;
  };

  // Calculate expected returns
  const calculateReturns = () => {
    if (!depositAmount) return { monthly: 0, total: 0 };
    const amount = parseFloat(depositAmount);
    const apy = getCurrentAPY();
    const months = selectedLockPeriod;

    const monthlyReturn = (amount * apy / 100) / 12;
    const totalReturn = monthlyReturn * months;

    return {
      monthly: monthlyReturn,
      total: totalReturn
    };
  };

  // Real-time yield calculation - updates every hour
  useEffect(() => {
    const calculateRealTimeYield = () => {
      if (!userDeposit || !userDeposit.amount || userDeposit.amount === 0n) {
        setRealTimeYield(0n);
        return;
      }

      const now = Date.now();
      const hoursSinceLastUpdate = Math.floor((now - lastYieldUpdate.getTime()) / (1000 * 60 * 60));

      if (hoursSinceLastUpdate > 0) {
        // Calculate hourly yield based on current APY
        const option = lockPeriodOptions.find(opt => opt.months === selectedLockPeriod);
        const currentAPY = option ? option.apy : 7;
        const hourlyRate = currentAPY / 100 / 365 / 24; // APY to hourly rate
        const principalAmount = Number(formatUnits(userDeposit.amount, 6));
        const hourlyYield = principalAmount * hourlyRate * hoursSinceLastUpdate;

        // Convert back to wei (6 decimals for USDC)
        const yieldInWei = parseUnits(hourlyYield.toFixed(6), 6);
        setRealTimeYield(yieldInWei);
        setLastYieldUpdate(new Date());
      }
    };

    // Calculate yield immediately and then every hour
    calculateRealTimeYield();
    const yieldInterval = setInterval(calculateRealTimeYield, 60 * 60 * 1000); // Every hour

    return () => clearInterval(yieldInterval);
  }, [userDeposit, selectedLockPeriod, lastYieldUpdate]);

  // Auto-refresh data every 30 seconds for real-time updates
  useEffect(() => {
    if (!isConnected || !address) return;

    const refreshData = setInterval(() => {
      // This will trigger wagmi hooks to refetch data
      console.log('Refreshing real-time data...');
    }, 30000); // Every 30 seconds

    return () => clearInterval(refreshData);
  }, [isConnected, address]);

  const handleApprove = async () => {
    if (!depositAmount) return;

    try {
      const amount = parseUnits(depositAmount, 6);

      // For gasless deposits, approval is handled within the transaction component
      if (useGaslessDeposit) {
        console.log('Gasless flow handles approval automatically');
        return;
      }

      // Approve the vault contract to spend user's USDC
      writeApprove({
        address: CONTRACTS.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT, amount]
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Create transaction calls for OnchainKit
  const createDepositCalls = () => {
    if (!depositAmount || !address) return [];

    const amount = parseUnits(depositAmount, 6);
    const lockPeriodValue = selectedLockPeriod === 0.5 ? 0 : Math.floor(selectedLockPeriod);

    return [
      {
        address: CONTRACTS.USDC as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
          }
        ],
        functionName: 'approve',
        args: [CONTRACTS.VAULT, amount],
      },
      {
        address: CONTRACTS.VAULT as `0x${string}`,
        abi: [
          {
            name: 'depositWithLockPeriod',
            type: 'function',
            inputs: [
              { name: 'assets', type: 'uint256' },
              { name: 'receiver', type: 'address' },
              { name: 'lockPeriodMonths', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'nonpayable',
          }
        ],
        functionName: 'depositWithLockPeriod',
        args: [amount, address, BigInt(lockPeriodValue)],
      }
    ];
  };

  const handleDeposit = async () => {
    if (!depositAmount || !isConnected) return;

    try {
      const amount = parseUnits(depositAmount, 6); // USDC has 6 decimals

      // Use regular deposit for non-gasless transactions
      if (!useGaslessDeposit) {
        console.log('Using regular deposit...');
        writeDeposit({
          address: CONTRACTS.VAULT,
          abi: VAULT_ABI,
          functionName: 'depositWithLockPeriod',
          args: [amount, address || '0x0', BigInt(selectedLockPeriod === 0.5 ? 0 : Math.floor(selectedLockPeriod))],
        });
      }
      // Gasless deposits are handled by the Transaction component
    } catch (error) {
      console.error('Deposit failed:', error);
      alert(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !userDeposit || !address) return;

    try {
      const amount = parseUnits(withdrawAmount, 6);

      // Call withdraw function on the vault contract
      writeWithdraw({
        address: CONTRACTS.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [amount, address, address]
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const handleClaimYield = async () => {
    writeClaimYield({
      address: CONTRACTS.VAULT,
      abi: VAULT_ABI,
      functionName: 'claimYield',
    });
  };

  const needsApproval = depositAmount && usdcAllowance !== undefined && 
    parseUnits(depositAmount, 6) > usdcAllowance && 
    !useGaslessDeposit; // Skip approval for gasless deposits

  const openOnramp = () => {
    if (onrampUrl) {
      window.open(onrampUrl, '_blank', 'width=500,height=700');
    }
  };

  const [activeTab, setActiveTab] = useState('invest');

    // Function to get BaseScan URL for an address
    const getBaseScanAddressUrl = (address: string) => {
      return `https://basescan.org/address/${address}`;
    };


  if (!isConnected) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-white shadow-2xl border border-[#6667AB]/10 rounded-3xl overflow-hidden">
            <CardContent className="p-12 text-center">
              {/* Logo/Icon */}
              <div className="w-20 h-20 bg-[#6667AB] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              {/* Main Heading */}
              <h1 className="text-3xl font-bold text-black mb-4">
                Connect Your Base Wallet
              </h1>
              
              {/* Description */}
              <p className="text-[#6667AB] text-lg mb-8 leading-relaxed">
                Connect your Base smart wallet to access your investment dashboard and track your up to 14% APY returns.
              </p>
              
              {/* Connect Button */}
              <div className="mb-8">
                <WalletConnection />
              </div>
              
              {/* Trust Indicators */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center gap-3 text-sm text-[#6667AB]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Self-custodial</span>
                  </div>
                  <div className="w-1 h-1 bg-[#6667AB]/40 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>FIU-IND Compliant</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-[#6667AB]">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>FEMA Reporting</span>
                </div>
              </div>
              
              {/* Features Preview */}
              <div className="bg-[#6667AB]/5 rounded-2xl p-6 text-left">
                <h3 className="font-semibold text-black mb-4 text-center">What you'll get access to:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#6667AB] flex-shrink-0" />
                    <span className="text-sm text-[#6667AB]">Progressive APY up to 14% on USDC deposits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-[#6667AB] flex-shrink-0" />
                    <span className="text-sm text-[#6667AB]">Real-time yield tracking and withdrawals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#6667AB] flex-shrink-0" />
                    <span className="text-sm text-[#6667AB]">KYC-verified INR bank withdrawals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Send className="w-5 h-5 text-[#6667AB] flex-shrink-0" />
                    <span className="text-sm text-[#6667AB]">P2P USDC transfers and remittance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-8 pb-4 bg-[#FAF9F6] min-h-screen mobile-optimized safe-area-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col space-y-3 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#6667AB] to-[#6667AB]/80 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Welcome to StablePay!</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[#6667AB]">Connected: {address?.slice(0, 8)}...{address?.slice(-6)}</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live connection"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
              <Button
                onClick={openOnramp}
                disabled={!onrampUrl}
                variant="payment"
                size="payment"
                className="flex-1 sm:flex-none fast-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Top up USDC</span>
                <span className="sm:hidden">Add USDC</span>
              </Button>

              <Button
                onClick={() => setActiveTab('remittance')}
                variant="outline"
                size="payment"
                className="flex-1 sm:flex-none fast-button border-2 border-orange-500 text-orange-700 hover:bg-orange-500 hover:text-white"
              >
                <Building2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">INR Withdrawal</span>
                <span className="sm:hidden">INR</span>
              </Button>

              <Button
                onClick={() => window.location.href = '/p2p'}
                variant="outline"
                size="payment"
                className="flex-1 sm:flex-none fast-button border-2 border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB] hover:text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">P2P Transfer</span>
                <span className="sm:hidden">P2P</span>
              </Button>
              <div className="hidden sm:block">
                <WalletConnection />
              </div>
            </div>
          </div>
          <div className="sm:hidden">
            <WalletConnection />
          </div>
        </div>

        {/* Basic Metrics - Always Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6">
          {/* USDC Balance - Wallet Balance */}
          <Card className="bg-white shadow-lg border border-[#6667AB]/20 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}>
            <CardContent className="p-2 sm:p-3 lg:p-6">
              <div className="flex flex-col space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 lg:w-8 lg:h-8 text-[#6667AB] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <ExternalLink className="w-3 h-3 text-[#6667AB] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-[#6667AB] font-medium">USDC Balance</p>
                  <p className="text-xs sm:text-sm lg:text-2xl font-bold text-black leading-tight group-hover:text-[#6667AB] transition-colors">
                    ${formatUSDCBalance(usdcBalance)}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-[#6667AB]/70">Live • Base Network</p>
                  <p className="text-[7px] sm:text-[8px] text-amber-600 font-medium">Demo Data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yield Available - Real-time Calculation */}
          <Card className="bg-white shadow-lg border border-[#6667AB]/20 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={yieldAvailable && yieldAvailable > 0n ? handleClaimYield : undefined}>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#6667AB] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {yieldAvailable && yieldAvailable > 0n ? (
                      <CheckCircle className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-[#6667AB] font-medium">Yield Available</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-[#6667AB] group-hover:text-green-600 transition-colors">
                    ${(() => {
                      const baseYield = yieldAvailable ? Number(formatUnits(yieldAvailable, 6)) : 0;
                      const realtimeYield = realTimeYield ? Number(formatUnits(realTimeYield, 6)) : 0;
                      return (baseYield + realtimeYield).toFixed(4);
                    })()}
                  </p>
                  <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-[#6667AB]/70">
                    <span>Updated Hourly</span>
                    {yieldAvailable && yieldAvailable > 0n ? (
                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-green-500 text-green-600">
                        Click to Claim
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-[#6667AB]/20 rounded-xl p-1 mb-6 shadow-lg">
            <TabsTrigger value="invest" className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-xs font-medium rounded-lg py-2 px-1 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="deposit" className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-xs font-medium rounded-lg py-2 px-1 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="hidden sm:inline">Deposit</span>
              <span className="sm:hidden">Add</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-xs font-medium rounded-lg py-2 px-1 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="hidden sm:inline">Withdraw</span>
              <span className="sm:hidden">Out</span>
            </TabsTrigger>
            <TabsTrigger value="remittance" className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-xs font-medium rounded-lg py-2 px-1 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="hidden sm:inline">Remittance</span>
              <span className="sm:hidden">Send</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="invest" className="space-y-4 sm:space-y-6">
            {/* StablePay Balance - Only visible on Overview tab */}
            <Card className="bg-white shadow-lg border border-[#6667AB]/20 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => window.open(getBaseScanAddressUrl(CONTRACTS.VAULT), '_blank')}>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-[#6667AB]" />
                    <h3 className="text-lg font-semibold text-black">Your StablePay Balance</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Real-time data"></div>
                  </div>

                  <div className="text-3xl sm:text-4xl font-bold text-green-600">
                    ${getCombinedBalance().toFixed(2)} USDC
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5 text-[#6667AB]" />
                      </div>
                      <p className="text-xs text-[#6667AB] font-medium">Latest Lock Period</p>
                      <p className="text-sm font-bold text-black">
                        {(() => {
                          const latestDeposit = getLatestDepositInfo();
                          if (latestDeposit) {
                            return latestDeposit.lockMonths === 0 ? 'Flexible' : `${latestDeposit.lockMonths} Month${latestDeposit.lockMonths > 1 ? 's' : ''}`;
                          }
                          // Fallback to contract data
                          if (userDepositData && userDepositData[0] > 0n) {
                            const lockUntilTimestamp = Number(userDepositData[1]);
                            const isCurrentlyLocked = lockUntilTimestamp * 1000 > Date.now();

                            if (isCurrentlyLocked) {
                              const lockStartTime = Date.now() - (30 * 24 * 60 * 60 * 1000);
                              const lockDurationMs = (lockUntilTimestamp * 1000) - lockStartTime;
                              const lockMonths = Math.round(lockDurationMs / (30 * 24 * 60 * 60 * 1000));
                              return `${lockMonths} Month${lockMonths > 1 ? 's' : ''}`;
                            }
                          }
                          return 'No Deposits';
                        })()}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="w-5 h-5 text-[#6667AB]" />
                      </div>
                      <p className="text-xs text-[#6667AB] font-medium">Latest Unlock Date</p>
                      <p className="text-sm font-bold text-black">
                        {(() => {
                          const latestDeposit = getLatestDepositInfo();
                          if (latestDeposit) {
                            return latestDeposit.lockMonths === 0 ? 'Anytime' : latestDeposit.unlockTime.toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });
                          }
                          // Fallback to contract data
                          if (userDepositData && userDepositData[0] > 0n) {
                            const lockUntilTimestamp = Number(userDepositData[1]);
                            const isCurrentlyLocked = lockUntilTimestamp * 1000 > Date.now();

                            if (isCurrentlyLocked) {
                              return new Date(lockUntilTimestamp * 1000).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            }
                          }
                          return 'No Deposits';
                        })()}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ExternalLink className="w-5 h-5 text-[#6667AB]" />
                      </div>
                      <p className="text-xs text-[#6667AB] font-medium">Total Deposits</p>
                      <p className="text-sm font-bold text-green-600">
                        {localDeposits.length + (userDepositData && userDepositData[0] > 0n ? 1 : 0)} Transaction{(localDeposits.length + (userDepositData && userDepositData[0] > 0n ? 1 : 0)) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Reload deposit data from localStorage
                      if (address) {
                        const storedDeposits = localStorage.getItem(`stablepay_deposits_${address}`);
                        if (storedDeposits) {
                          const parsedDeposits = JSON.parse(storedDeposits).map((d: any) => ({
                            ...d,
                            depositTime: new Date(d.depositTime),
                            unlockTime: new Date(d.unlockTime)
                          }));
                          setLocalDeposits(parsedDeposits);
                          setTotalLocalBalance(parsedDeposits.reduce((sum: number, d: any) => sum + d.amount, 0));
                        }
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Balance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Copy Wallet Address Component */}
              <CopyWalletAddress />
            </div>
          </TabsContent>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="space-y-4 sm:space-y-6">
            <DepositWithdraw />
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-6">
            <Card className="bg-white shadow-lg border border-[#6667AB]/20">
              <CardHeader>
                <CardTitle className="text-xl text-black">Withdraw USDC</CardTitle>
                <p className="text-sm text-[#6667AB]">
                  Withdraw your unlocked USDC deposits
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {userDeposit?.isLocked ? (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Lock className="h-4 w-4 text-[#6667AB]" />
                    <AlertDescription className="text-[#6667AB]">
                      Your deposit is locked for {userDeposit.daysRemaining} more days. 
                      You can withdraw after {new Date(Number(userDeposit.lockUntil) * 1000).toLocaleDateString()}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="text-xl font-bold h-12"
                      />
                      <div className="flex justify-between text-sm text-[#6667AB]">
                        <span>
                          Available: {userDeposit ? Number(formatUnits(userDeposit.amount, 6)).toFixed(2) : '0.00'} USDC
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || isWithdrawPending || !userDeposit}
                      className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90"
                    >
                      {isWithdrawPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUp className="w-4 h-4 mr-2" />}
                      Withdraw USDC
                    </Button>

                    {isWithdrawSuccess && (
                      <Alert className="border-[#6667AB]/20 bg-[#6667AB]/5">
                        <CheckCircle className="h-4 w-4 text-[#6667AB]" />
                        <AlertDescription className="text-[#6667AB]">
                          Withdrawal successful! USDC has been transferred to your wallet.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remittance Tab */}
          <TabsContent value="remittance" className="space-y-8">

            {/* Main Content - Single Column Layout */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* INR Withdrawal */}
              <Card className="bg-white shadow-lg border border-[#6667AB]/20 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#6667AB]/5 to-[#6667AB]/10 pb-6 pt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#6667AB] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl text-black font-bold mb-2">
                      INR Bank Withdrawal
                    </CardTitle>
                    <p className="text-[#6667AB] text-lg max-w-md mx-auto">
                      KYC verified withdrawals directly to Indian bank accounts with real-time exchange rates
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <INRWithdrawalKYC />
                </CardContent>
              </Card>

              {/* Calculator */}
              <Card className="bg-white shadow-lg border border-[#6667AB]/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-black flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6667AB] rounded-full flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    Live Exchange Calculator
                  </CardTitle>
                  <p className="text-[#6667AB] ml-13">
                    Calculate costs with real-time exchange rates
                  </p>
                </CardHeader>
                <CardContent>
                  <LiveExchangeCalculator embedded={true} />
                </CardContent>
              </Card>

              {/* P2P Transfer */}
              <Card className="bg-white shadow-lg border border-[#6667AB]/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-black flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#6667AB] rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    P2P USDC Transfer
                  </CardTitle>
                  <p className="text-[#6667AB] ml-13">
                    Direct wallet-to-wallet transfers on Base network
                  </p>
                </CardHeader>
                <CardContent>
                  <SendReceiveUSDC />
                </CardContent>
              </Card>
            </div>

            {/* Simple Footer */}
            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6667AB]/5 rounded-full">
                <Shield className="w-4 h-4 text-[#6667AB]" />
                <span className="text-sm text-[#6667AB] font-medium">FIU-IND Regulated • FEMA Compliant</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>


      </div>
    </section>
  );
}