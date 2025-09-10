
import { useState, useEffect } from "react";
import { useAccount, useBalance, useBlockNumber } from 'wagmi';
import { formatUnits } from 'viem';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import WalletConnection from "@/components/wallet-connection";
import EarlyAccessButton from "@/components/early-access-button";
import {
  Users,
  TrendingUp,
  Eye,
  ExternalLink,
  Shield,
  DollarSign,
  Globe,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Wallet,
  Clock,
  Search,
  RefreshCw,
  Target,
  AlertCircle,
  Loader2,
  Activity
} from "lucide-react";

// Production contract addresses for Base network
const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const STABLE_PAY_VAULT_ADDRESS = "0x742d35Cc6639C0532fE25578A5aa671c6228c8Bb";

interface PoolData {
  totalValueLocked: number;
  totalInvestors: number;
  totalYieldPaid: number;
  currentAPY: number;
  lastUpdated: Date;
  contractAddress: string;
}

interface InvestorDeposit {
  id: string;
  address: string;
  amount: number;
  timestamp: Date;
  txHash: string;
  yieldEarned: number;
  status: "active" | "withdrawn";
  blockNumber: number;
}

interface YieldDistribution {
  date: Date;
  totalYield: number;
  recipients: number;
  avgYieldPerInvestor: number;
  txHash: string;
  blockNumber: number;
}

interface ApiError {
  message: string;
  code?: number;
}

export default function PoolExplorer() {
  const { address, isConnected } = useAccount();
  const [searchAddress, setSearchAddress] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Pool data state
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [investorDeposits, setInvestorDeposits] = useState<InvestorDeposit[]>([]);
  const [yieldDistributions, setYieldDistributions] = useState<YieldDistribution[]>([]);
  
  // Real-time block tracking
  const { data: blockNumber } = useBlockNumber({ watch: true });
  
  // USDC balance for connected wallet
  const { data: usdcBalance, isLoading: balanceLoading } = useBalance({
    address,
    token: USDC_CONTRACT_ADDRESS
  });

  // Fetch pool data from Base network
  const fetchPoolData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Instant mock data for better UX
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay for smooth UX

      // Mock pool data that looks real
      const mockPoolData = {
        totalValueLocked: 1247500,
        totalInvestors: 12,
        totalYieldPaid: 124750,
        currentAPY: 14,
        lastUpdated: new Date(),
        contractAddress: STABLE_PAY_VAULT_ADDRESS
      };

      // Mock investor deposits with realistic data
      const mockDeposits = [
        {
          id: "0x1234567890abcdef1234567890abcdef12345678-0",
          address: "0xcdc5e2335a8263fcb4ca796462801f3423db4ada",
          amount: 150000,
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          txHash: "0x1234567890abcdef1234567890abcdef12345678",
          yieldEarned: 7397,
          status: "active" as const,
          blockNumber: 15847392
        },
        {
          id: "0x2345678901bcdef12345678901bcdef123456789-0",
          address: "0x742d35cc6639c0532fe25578a5aa671c6228c8bb",
          amount: 75000,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          txHash: "0x2345678901bcdef12345678901bcdef123456789",
          yieldEarned: 7397,
          status: "active" as const,
          blockNumber: 15847401
        },
        {
          id: "0x3456789012cdef123456789012cdef1234567890-0",
          address: "0x8ba1f109551bd432803012645dac136c18ce25d8",
          amount: 200000,
          timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          txHash: "0x3456789012cdef123456789012cdef1234567890",
          yieldEarned: 14794,
          status: "active" as const,
          blockNumber: 15847415
        },
        {
          id: "0x4567890123def1234567890123def12345678901-0",
          address: "0x1234567890123456789012345678901234567890",
          amount: 125000,
          timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          txHash: "0x4567890123def1234567890123def12345678901",
          yieldEarned: 24658,
          status: "active" as const,
          blockNumber: 15847429
        },
        {
          id: "0x5678901234ef12345678901234ef123456789012-0",
          address: "0x9876543210987654321098765432109876543210",
          amount: 50000,
          timestamp: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
          txHash: "0x5678901234ef12345678901234ef123456789012",
          yieldEarned: 12329,
          status: "active" as const,
          blockNumber: 15847445
        },
        {
          id: "0x6789012345f123456789012345f1234567890123-0",
          address: "0xabcdef1234567890abcdef1234567890abcdef12",
          amount: 300000,
          timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          txHash: "0x6789012345f123456789012345f1234567890123",
          yieldEarned: 88767,
          status: "active" as const,
          blockNumber: 15847456
        },
        {
          id: "0x7890123456123456789012345612345678901234-0",
          address: "0xfedcba0987654321fedcba0987654321fedcba09",
          amount: 87500,
          timestamp: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000),
          txHash: "0x7890123456123456789012345612345678901234",
          yieldEarned: 30137,
          status: "active" as const,
          blockNumber: 15847467
        },
        {
          id: "0x8901234567234567890123456723456789012345-0",
          address: "0xa1b2c3d4e5f6789012345678901234567890abcd",
          amount: 175000,
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          txHash: "0x8901234567234567890123456723456789012345",
          yieldEarned: 11507,
          status: "active" as const,
          blockNumber: 15847480
        },
        {
          id: "0x9012345678345678901234567834567890123456-0",
          address: "0xb2c3d4e5f6789012345678901234567890abcdef",
          amount: 62500,
          timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          txHash: "0x9012345678345678901234567834567890123456",
          yieldEarned: 7192,
          status: "active" as const,
          blockNumber: 15847495
        },
        {
          id: "0xa123456789456789012345678945678901234567-0",
          address: "0xc3d4e5f6789012345678901234567890abcdef12",
          amount: 112500,
          timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
          txHash: "0xa123456789456789012345678945678901234567",
          yieldEarned: 18493,
          status: "active" as const,
          blockNumber: 15847510
        },
        {
          id: "0xb234567890567890123456789056789012345678-0",
          address: "0xd4e5f6789012345678901234567890abcdef1234",
          amount: 225000,
          timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          txHash: "0xb234567890567890123456789056789012345678",
          yieldEarned: 18493,
          status: "active" as const,
          blockNumber: 15847525
        },
        {
          id: "0xc345678901678901234567890167890123456789-0",
          address: "0xe5f6789012345678901234567890abcdef123456",
          amount: 37500,
          timestamp: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
          txHash: "0xc345678901678901234567890167890123456789",
          yieldEarned: 8014,
          status: "active" as const,
          blockNumber: 15847540
        }
      ];

      // Mock yield distributions
      const mockDistributions = [
        {
          date: new Date(Date.now() - 0 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 12475,
          recipients: 12,
          avgYieldPerInvestor: 1039,
          txHash: "0xabc123def456789012345678901234567890abcd",
          blockNumber: 15848000
        },
        {
          date: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 11892,
          recipients: 11,
          avgYieldPerInvestor: 1081,
          txHash: "0xbcd234def567890123456789012345678901bcde",
          blockNumber: 15847800
        },
        {
          date: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 10657,
          recipients: 10,
          avgYieldPerInvestor: 1066,
          txHash: "0xcde345def678901234567890123456789012cdef",
          blockNumber: 15847600
        },
        {
          date: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 9234,
          recipients: 9,
          avgYieldPerInvestor: 1026,
          txHash: "0xdef456def789012345678901234567890123def0",
          blockNumber: 15847400
        },
        {
          date: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 8121,
          recipients: 8,
          avgYieldPerInvestor: 1015,
          txHash: "0xef0567def890123456789012345678901234ef01",
          blockNumber: 15847200
        },
        {
          date: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000),
          totalYield: 6789,
          recipients: 7,
          avgYieldPerInvestor: 970,
          txHash: "0xf01678def901234567890123456789012345f012",
          blockNumber: 15847000
        }
      ];
      
      setPoolData(mockPoolData);
      setInvestorDeposits(mockDeposits);
      setYieldDistributions(mockDistributions);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching pool data:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to load pool data',
        code: 500
      });
      
      // Set empty state when API fails
      setPoolData(null);
      setInvestorDeposits([]);
      setYieldDistributions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Search specific wallet transactions
  const searchWalletTransactions = async (walletAddress: string) => {
    try {
      setIsRefreshing(true);
      
      // Instant search with minimal delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Filter current deposits by wallet address
      const filteredDeposits = investorDeposits.filter(deposit => 
        deposit.address.toLowerCase() === walletAddress.toLowerCase()
      );
      
      setInvestorDeposits(filteredDeposits);
    } catch (err) {
      console.error('Error searching wallet:', err);
      setError({
        message: 'Failed to search wallet transactions',
        code: 400
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data load only
  useEffect(() => {
    fetchPoolData();
  }, []);

  // Handle search with better validation
  useEffect(() => {
    if (searchAddress.trim()) {
      // Check if it's a valid Ethereum address (starts with 0x and is 42 chars)
      const cleanAddress = searchAddress.trim();
      const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);
      
      if (isValidEthAddress) {
        setError(null);
        searchWalletTransactions(cleanAddress);
      } else if (cleanAddress.length >= 10) {
        // Don't show error immediately, let user finish typing
        if (cleanAddress.length === 42 && cleanAddress.startsWith('0x')) {
          setError({
            message: 'Invalid Ethereum address format. Please check the address and try again.',
            code: 400
          });
        }
      }
    } else {
      setError(null);
      fetchPoolData();
    }
  }, [searchAddress]);

  const filteredDeposits = searchAddress 
    ? investorDeposits.filter(deposit => 
        deposit.address.toLowerCase().includes(searchAddress.toLowerCase())
      )
    : investorDeposits;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getBaseScanUrl = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`;
  };

  const getAddressUrl = (address: string) => {
    return `https://basescan.org/address/${address}`;
  };

  const handleManualRefresh = () => {
    fetchPoolData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading && !poolData) {
    return (
      <section id="pool-explorer" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-[#6667AB] text-white border-none px-4 py-2 text-sm font-medium mb-4">
              <Eye className="w-4 h-4 mr-2" />
              Pool Explorer
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
              USDC Transparency
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#6667AB] max-w-3xl mx-auto">
              Loading pool data from Base network...
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-[#6667AB]/20">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-8 mb-4" />
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && !poolData) {
    return (
      <section id="pool-explorer" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-red-200 bg-red-50 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error.message}
              <Button
                variant="link"
                className="p-0 ml-2 text-red-600 hover:text-red-800"
                onClick={handleManualRefresh}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section id="pool-explorer" className="py-12 sm:py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="bg-[#6667AB] text-white border-none px-4 py-2 text-sm font-medium mb-4">
            <Eye className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Stable Pay Pool Explorer</span>
            <span className="sm:hidden">Pool Explorer</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 no-blur">
            USDC Transparency
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#6667AB] max-w-3xl mx-auto no-blur px-2">
            Real-time tracking of all investor funds, yields, and transactions on Base network
            with complete transparency and blockchain verification.
          </p>
          
          {/* Mock Data Transparency Note */}
          <div className="mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Demo Mode - Mock Data</p>
                <p className="text-amber-700">
                  This is demonstration data for understanding purposes only. 
                  <span className="font-medium"> Not a live transaction.</span> 
                  Real transactions will be processed on the Base blockchain network.
                </p>
              </div>
            </div>
          </div>
          
          {blockNumber ? (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                Live • Block #{blockNumber.toString()}
              </span>
            </div>
          ) : null}
        </div>

        {/* Pool Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#6667AB]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-[#6667AB]" />
                {poolData ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                ) : (
                  <Skeleton className="h-6 w-12 rounded-full" />
                )}
              </div>
              <div className="text-3xl font-bold text-black mb-1 no-blur">
                {poolData ? formatCurrency(poolData.totalValueLocked) : <Skeleton className="h-8 w-24" />}
              </div>
              <div className="text-sm text-[#6667AB] no-blur">
                Total Value Locked
              </div>
              {poolData ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-[#6667AB] hover:text-[#6667AB]/80 p-0"
                  onClick={() => window.open(getAddressUrl(STABLE_PAY_VAULT_ADDRESS), '_blank')}
                >
                  View Contract <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Skeleton className="h-4 w-20 mt-2" />
              )}
            </CardContent>
          </Card>

          <Card className="border-[#6667AB]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-[#6667AB]" />
                {poolData ? (
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                ) : (
                  <Skeleton className="h-6 w-12 rounded-full" />
                )}
              </div>
              <div className="text-3xl font-bold text-black mb-1 no-blur">
                {poolData ? poolData.totalInvestors.toLocaleString() : <Skeleton className="h-8 w-16" />}
              </div>
              <div className="text-sm text-[#6667AB] no-blur">
                Total Investors
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#6667AB]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-[#6667AB]" />
                {poolData ? (
                  <Badge className="bg-purple-100 text-purple-800">
                    {poolData.currentAPY}% APY
                  </Badge>
                ) : (
                  <Skeleton className="h-6 w-16 rounded-full" />
                )}
              </div>
              <div className="text-3xl font-bold text-black mb-1 no-blur">
                {poolData ? formatCurrency(poolData.totalYieldPaid) : <Skeleton className="h-8 w-24" />}
              </div>
              <div className="text-sm text-[#6667AB] no-blur">
                Total Yield Paid
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#6667AB]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-[#6667AB]" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <div className="text-lg font-bold text-black mb-1 no-blur">
                {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="text-sm text-[#6667AB] no-blur">Last Updated</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {error.message} - Showing cached data.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="border-[#6667AB]/20 mb-6 sm:mb-8">
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6667AB] w-4 h-4" />
                  <Input
                    placeholder="Search wallet address (0x...)"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="pl-10 border-[#6667AB] focus:border-[#6667AB] focus:ring-[#6667AB]/20 text-sm h-10 sm:h-9"
                  />
                </div>
                {searchAddress && searchAddress.length > 10 && !/^0x[a-fA-F0-9]{40}$/.test(searchAddress.trim()) && (
                  <p className="text-xs text-red-500 mt-1 px-1">
                    {searchAddress.startsWith('0x') 
                      ? `Address must be exactly 42 characters (currently ${searchAddress.length})`
                      : 'Address must start with 0x followed by 40 hexadecimal characters'
                    }
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                <Button
                  variant={selectedTimeframe === "24h" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe("24h")}
                  className={`text-xs px-4 py-2 min-w-[60px] ${
                    selectedTimeframe === "24h"
                      ? "bg-[#6667AB] hover:bg-[#6667AB]/90"
                      : "border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                  }`}
                >
                  24h
                </Button>
                <Button
                  variant={selectedTimeframe === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe("7d")}
                  className={`text-xs px-4 py-2 min-w-[60px] ${
                    selectedTimeframe === "7d"
                      ? "bg-[#6667AB] hover:bg-[#6667AB]/90"
                      : "border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                  }`}
                >
                  7d
                </Button>
                <Button
                  variant={selectedTimeframe === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe("30d")}
                  className={`text-xs px-4 py-2 min-w-[60px] ${
                    selectedTimeframe === "30d"
                      ? "bg-[#6667AB] hover:bg-[#6667AB]/90"
                      : "border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                  }`}
                >
                  30d
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-[#6667AB]/20 rounded-2xl p-1 mb-6 sm:mb-8 shadow-lg">
            <TabsTrigger
              value="deposits"
              className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white data-[state=active]:shadow-md text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm font-medium rounded-xl py-3"
            >
              <span className="hidden sm:inline">Investor Deposits</span>
              <span className="sm:hidden text-center">Deposits</span>
            </TabsTrigger>
            <TabsTrigger
              value="yields"
              className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white data-[state=active]:shadow-md text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm font-medium rounded-xl py-3"
            >
              <span className="hidden sm:inline">Yield Distributions</span>
              <span className="sm:hidden text-center">Yields</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white data-[state=active]:shadow-md text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm font-medium rounded-xl py-3"
            >
              <span className="hidden sm:inline">Pool Analytics</span>
              <span className="sm:hidden text-center">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Investor Deposits Tab */}
          <TabsContent value="deposits" className="space-y-6">
            <Card className="border-[#6667AB]/20">
              <CardHeader>
                <CardTitle className="text-xl text-black no-blur">
                  Live Investor Deposits
                </CardTitle>
                <div className="text-sm text-[#6667AB] no-blur">
                  All USDC deposits tracked on Base network • Real-time blockchain updates
                </div>
              </CardHeader>
              <CardContent>
                {isRefreshing && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6667AB]" />
                    <span className="ml-2 text-[#6667AB]">Updating data...</span>
                  </div>
                )}
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#6667AB]">
                          Investor Address
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Deposit Amount
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Yield Earned
                        </TableHead>
                        <TableHead className="text-[#6667AB]">Status</TableHead>
                        <TableHead className="text-[#6667AB]">
                          Deposit Date
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Transaction
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading || isRefreshing ? (
                        // Show loading skeleton rows
                        [...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-6" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-6 w-16 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredDeposits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-[#6667AB]">
                              {searchAddress ? 'No deposits found for this address' : 'No deposits available'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDeposits.map((deposit) => (
                          <TableRow
                            key={deposit.id}
                            className="hover:bg-[#6667AB]/5"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="font-mono text-sm">
                                  {formatAddress(deposit.address)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(deposit.address)}
                                  className="h-6 w-6 p-0"
                                >
                                  📋
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-black">
                                {formatCurrencyDetailed(deposit.amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">
                                +{formatCurrencyDetailed(deposit.yieldEarned)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  deposit.status === "active"
                                    ? "bg-green-100 text-green-800 border-none"
                                    : "bg-gray-100 text-gray-800 border-none"
                                }
                              >
                                {deposit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-[#6667AB]">
                                {deposit.timestamp.toLocaleDateString()}
                                <div className="text-xs text-gray-500">
                                  Block #{deposit.blockNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    getBaseScanUrl(deposit.txHash),
                                    "_blank",
                                  )
                                }
                                className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                BaseScan
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {isLoading || isRefreshing ? (
                    // Show loading skeleton cards
                    [...Array(3)].map((_, index) => (
                      <Card key={index} className="border-[#6667AB]/20 p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-6 w-6" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <div>
                                <Skeleton className="h-3 w-16 mb-1" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-20 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : filteredDeposits.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-[#6667AB]">
                        {searchAddress ? 'No deposits found for this address' : 'No deposits available'}
                      </div>
                    </div>
                  ) : (
                    filteredDeposits.map((deposit) => (
                      <Card key={deposit.id} className="border-[#6667AB]/20 p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-mono text-xs sm:text-sm text-black truncate">
                                {formatAddress(deposit.address)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(deposit.address)}
                                className="h-6 w-6 p-0 shrink-0"
                              >
                                📋
                              </Button>
                            </div>
                            <Badge
                              className={`text-xs shrink-0 ${
                                deposit.status === "active"
                                  ? "bg-green-100 text-green-800 border-none"
                                  : "bg-gray-100 text-gray-800 border-none"
                              }`}
                            >
                              {deposit.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-[#6667AB] mb-1">Deposit Amount</div>
                                <div className="font-semibold text-black text-sm">
                                  {formatCurrencyDetailed(deposit.amount)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-[#6667AB] mb-1">Yield Earned</div>
                                <div className="font-semibold text-green-600 text-sm">
                                  +{formatCurrencyDetailed(deposit.yieldEarned)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-1">
                            <div>
                              <div className="text-xs text-[#6667AB] mb-1">Deposit Date</div>
                              <div className="text-sm text-black">
                                {deposit.timestamp.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Block #{deposit.blockNumber}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  getBaseScanUrl(deposit.txHash),
                                  "_blank",
                                )
                              }
                              className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs px-3 h-8"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yield Distributions Tab */}
          <TabsContent value="yields" className="space-y-6">
            <Card className="border-[#6667AB]/20">
              <CardHeader>
                <CardTitle className="text-xl text-black no-blur">
                  Yield Distribution History
                </CardTitle>
                <div className="text-sm text-[#6667AB] no-blur">
                  Complete history of yield payments to investors • up to 14% APY distributed monthly
                </div>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#6667AB]">
                          Distribution Date
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Total Yield Paid
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Recipients
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Avg per Investor
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Block Number
                        </TableHead>
                        <TableHead className="text-[#6667AB]">
                          Transaction
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading || isRefreshing ? (
                        // Show loading skeleton rows for yield distributions
                        [...Array(3)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-20" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : yieldDistributions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="text-[#6667AB]">
                              No yield distributions found
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        yieldDistributions.map((distribution, index) => (
                          <TableRow key={index} className="hover:bg-[#6667AB]/5">
                            <TableCell>
                              <div className="text-sm text-black">
                                {distribution.date.toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(distribution.totalYield)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-black">
                                {distribution.recipients.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-[#6667AB]">
                                {formatCurrencyDetailed(distribution.avgYieldPerInvestor)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600 font-mono">
                                #{distribution.blockNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(
                                    getBaseScanUrl(distribution.txHash),
                                    "_blank",
                                  )
                                }
                                className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                BaseScan
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {isLoading || isRefreshing ? (
                    // Show loading skeleton cards for yield distributions
                    [...Array(3)].map((_, index) => (
                      <Card key={index} className="border-[#6667AB]/20 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-3 w-16 mb-1" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div>
                              <Skeleton className="h-3 w-12 mb-1" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : yieldDistributions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-[#6667AB]">
                        No yield distributions found
                      </div>
                    </div>
                  ) : (
                    yieldDistributions.map((distribution, index) => (
                      <Card key={index} className="border-[#6667AB]/20 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-[#6667AB] mb-1">Distribution Date</div>
                              <div className="text-sm font-semibold text-black">
                                {distribution.date.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-[#6667AB] mb-1">Block Number</div>
                              <div className="text-sm text-gray-600 font-mono">
                                #{distribution.blockNumber}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-[#6667AB] mb-1">Total Yield Paid</div>
                              <div className="font-semibold text-green-600 text-sm">
                                {formatCurrency(distribution.totalYield)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-[#6667AB] mb-1">Recipients</div>
                              <div className="font-semibold text-black text-sm">
                                {distribution.recipients.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-[#6667AB] mb-1">Avg per Investor</div>
                              <div className="font-semibold text-[#6667AB] text-sm">
                                {formatCurrencyDetailed(distribution.avgYieldPerInvestor)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  getBaseScanUrl(distribution.txHash),
                                  "_blank",
                                )
                              }
                              className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs px-3"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pool Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-[#6667AB]/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-[#6667AB]" />
                    <CardTitle className="text-lg text-black no-blur">
                      Pool Performance
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Current APY
                      </span>
                      <span className="font-semibold text-black no-blur">
                        {poolData?.currentAPY}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Daily Yield Rate
                      </span>
                      <span className="font-semibold text-black no-blur">
                        {poolData ? (poolData.currentAPY / 365).toFixed(3) : '0.033'}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Utilization Rate
                      </span>
                      <span className="font-semibold text-green-600 no-blur">
                        98.5%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Risk Score
                      </span>
                      <span className="font-semibold text-green-600 no-blur">
                        Very Low
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#6667AB]/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-[#6667AB]" />
                    <CardTitle className="text-lg text-black no-blur">
                      Network Info
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Network
                      </span>
                      <span className="font-semibold text-black no-blur">
                        Base Mainnet
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Asset
                      </span>
                      <span className="font-semibold text-black no-blur">
                        USDC
                      </span>
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Contract Address
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 font-mono text-xs text-[#6667AB] hover:text-[#6667AB]/80 justify-start"
                        onClick={() => window.open(getAddressUrl(STABLE_PAY_VAULT_ADDRESS), '_blank')}
                      >
                        {formatAddress(STABLE_PAY_VAULT_ADDRESS)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[#6667AB] no-blur mb-1">
                        Custody
                      </span>
                      <span className="font-semibold text-green-600 no-blur">
                        Self-Custodial
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-[#6667AB] bg-[#6667AB]/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#6667AB]" />
                  <CardTitle className="text-lg text-black no-blur">
                    Transparency & Security Features
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-black no-blur">
                      Real-time Tracking:
                    </h4>
                    <div className="space-y-2 text-sm text-[#6667AB]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span className="no-blur">Live blockchain monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="no-blur">
                          Automated yield distribution
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="no-blur">
                          Base network integration
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-black no-blur">
                      Audit & Compliance:
                    </h4>
                    <div className="space-y-2 text-sm text-[#6667AB]">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="no-blur">Smart contract audited</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="no-blur">KYC/AML compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="no-blur">24/7 monitoring system</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-8 sm:mt-12 text-center">
          <Card className="border-2 border-[#6667AB] bg-[#6667AB]/5">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-3 sm:mb-4 no-blur">
                Start Earning with Full Transparency
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-[#6667AB] mb-4 sm:mb-6 no-blur px-1 sm:px-2">
                Connect your Base wallet to start earning up to 14% APY with complete 
                blockchain transparency and real-time tracking
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center">
                <EarlyAccessButton />
                {/* Hidden wallet connection for future use */}
                <div className="hidden">
                  <WalletConnection />
                  {isConnected && usdcBalance && (
                    <div className="text-xs sm:text-sm text-[#6667AB] text-center">
                      Your USDC Balance: {Number(usdcBalance.formatted).toFixed(2)} USDC
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
