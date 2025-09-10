import React, { useState, useEffect } from "react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import QRCode from 'qrcode';
import { 
  Send,
  Download,
  Wallet,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
  QrCode,
  ExternalLink,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

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
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface TransactionHistory {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  address: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export default function SendReceiveUSDC() {
  const { address, isConnected } = useAccount();
  const [sendAmount, setSendAmount] = useState("");
  const [sendToAddress, setSendToAddress] = useState("");
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [sendExpanded, setSendExpanded] = useState(false);
  const [receiveExpanded, setReceiveExpanded] = useState(false);

  // Get USDC balance
  const { data: usdcBalance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address,
    token: USDC_CONTRACT_ADDRESS
  });

  // Smart contract write hook for USDC transfer
  const { writeContract, isPending: isSending, data: sendHash } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isFailed } = useWaitForTransactionReceipt({
    hash: sendHash,
  });

  // Validate address input
  useEffect(() => {
    if (sendToAddress) {
      setIsAddressValid(isAddress(sendToAddress));
    } else {
      setIsAddressValid(true);
    }
  }, [sendToAddress]);

  // Generate QR code when address is available
  useEffect(() => {
    if (address) {
      QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('QR Code generation failed:', err);
      });
    }
  }, [address]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && sendHash) {
      const newTransaction: TransactionHistory = {
        hash: sendHash,
        type: 'send',
        amount: sendAmount,
        address: sendToAddress,
        timestamp: new Date(),
        status: 'confirmed'
      };
      setTransactionHistory(prev => [newTransaction, ...prev]);
      setSendAmount("");
      setSendToAddress("");
      refetchBalance();
    }
  }, [isConfirmed, sendHash, sendAmount, sendToAddress, refetchBalance]);

  const handleSendUSDC = async () => {
    if (!address || !sendAmount || !sendToAddress || !isAddressValid) {
      alert('Please fill in all required fields and ensure the recipient address is valid');
      return;
    }

    try {
      const amount = parseUnits(sendAmount, 6); // USDC has 6 decimals

      // Enhanced debugging
      console.log("=== USDC Transfer Debug ===");
      console.log("Network Chain ID:", 8453);
      console.log("USDC Contract:", USDC_CONTRACT_ADDRESS);
      console.log("From address:", address);
      console.log("To address:", sendToAddress);
      console.log("Amount (USDC):", sendAmount);
      console.log("Amount (wei):", amount.toString());
      console.log("User balance:", usdcBalance?.value?.toString());
      console.log("========================");

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

      // Additional validation checks
      if (!address) {
        alert('Wallet not connected. Please connect your wallet first.');
        return;
      }

      if (sendToAddress.toLowerCase() === address.toLowerCase()) {
        alert('Cannot send USDC to yourself.');
        return;
      }

      // Validate USDC contract address format (case-insensitive)
      if (USDC_CONTRACT_ADDRESS.toLowerCase() !== "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
        console.error('Wrong USDC contract address!');
        alert('Invalid USDC contract configuration. Please contact support.');
        return;
      }

      // Additional network validation
      try {
        const chainId = await window.ethereum?.request({ method: 'eth_chainId' });
        if (chainId !== '0x2105') { // Base chain ID in hex
          alert('Please switch to Base network in your wallet.');
          return;
        }
      } catch (networkError) {
        console.warn('Could not verify network:', networkError);
      }

      writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [sendToAddress as `0x${string}`, amount],
        gas: BigInt(300000), // Doubled gas limit for USDC transfers
        gasPrice: undefined, // Let wallet estimate gas price
      });
    } catch (error: any) {
      console.error('Send failed:', error);

      // Enhanced error handling with specific USDC transfer diagnostics
      console.error('USDC Transfer Error Details:', {
        message: error?.message,
        code: error?.code,
        cause: error?.cause,
        stack: error?.stack
      });

      if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
        alert('Transaction was cancelled by user.');
      } else if (error?.message?.includes('insufficient funds') || error?.message?.includes('insufficient balance')) {
        alert('Insufficient USDC balance for this transfer.');
      } else if (error?.message?.includes('invalid address')) {
        alert('Invalid recipient address. Please check and try again.');
      } else if (error?.message?.includes('execution reverted')) {
        alert('USDC transfer failed: Transaction reverted. Please check your USDC balance and try again.');
      } else if (error?.message?.includes('gas')) {
        alert('Transaction failed due to gas issues. The network may be congested. Please try again.');
      } else if (error?.message?.includes('nonce')) {
        alert('Transaction failed due to nonce issues. Please reset your wallet transaction history and try again.');
      } else if (error?.message?.includes('underpriced')) {
        alert('Transaction underpriced. Please increase gas price and try again.');
      } else if (error?.message?.includes('fraud warning') || error?.message?.includes('phishing')) {
        alert('Coinbase fraud warning detected. This is normal for USDC transfers. Click "Continue" in your wallet if you trust the recipient.');
      } else if (error?.code === 4001) {
        alert('Transaction was cancelled. If you saw a fraud warning, you can proceed by clicking "Continue" in your wallet.');
      } else if (error?.code === -32603) {
        alert('Network error. Please check your internet connection and try again.');
      } else if (error?.code === -32000) {
        alert('Insufficient funds for gas. Please ensure you have some ETH for transaction fees.');
      } else {
        alert(`USDC Transfer failed: ${error?.message || 'Unknown error'}

Troubleshooting:
1. Ensure you're on Base network
2. Check USDC balance: ${usdcBalance ? formatUnits(usdcBalance.value, 6) : '0'} USDC
3. If you see fraud warnings, click "Continue" in Coinbase Wallet
4. Try refreshing the page and reconnecting wallet

Contract: ${USDC_CONTRACT_ADDRESS}`);
      }
    }
  };

  const copyAddressToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(parseFloat(amount));
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return null;
  }

  return (
    <section className="py-6 sm:py-12 bg-[#FAF9F6] mb-8 sm:mb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="bg-[#6667AB] text-white border-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium mb-4">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Send & Receive USDC
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 no-blur">
            Transfer USDC on Base Network
          </h2>
          <p className="text-base sm:text-lg text-[#6667AB] max-w-2xl mx-auto no-blur">
            Send USDC to any Base address or receive USDC using your wallet address
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
        </div>



        {/* Mobile-first Tab Design */}
        <div className="block sm:hidden">
          <Tabs defaultValue="send" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-[#6667AB]/20 rounded-2xl p-1 mb-6 h-14">
              <TabsTrigger
                value="send"
                className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-sm font-medium rounded-xl py-3 h-12 flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send USDC
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-sm font-medium rounded-xl py-3 h-12 flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Receive USDC
              </TabsTrigger>
            </TabsList>

            {/* Send Tab Content */}
            <TabsContent value="send" className="mt-0">
              <Card className="border-2 border-[#6667AB]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#6667AB]/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#6667AB] to-[#6667AB]/80 rounded-full flex items-center justify-center shadow-lg">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-black">Send USDC</CardTitle>
                      <p className="text-sm text-[#6667AB]">Transfer USDC to any Base address</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-address" className="text-xs sm:text-sm font-medium text-black">
                    Recipient Address
                  </Label>
                  <Input
                    id="recipient-address"
                    placeholder="0x... (Base network address)"
                    value={sendToAddress}
                    onChange={(e) => setSendToAddress(e.target.value)}
                    className={`h-10 sm:h-12 text-sm ${!isAddressValid ? 'border-red-500 focus:border-red-500' : 'border-[#6667AB] focus:border-[#6667AB]'} focus:ring-[#6667AB]/20`}
                  />
                  {!isAddressValid && sendToAddress && (
                    <p className="text-xs sm:text-sm text-red-600 no-blur">Please enter a valid Ethereum address</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send-amount" className="text-xs sm:text-sm font-medium text-black">
                    Amount (USDC)
                  </Label>
                  <div className="relative">
                    <Input
                      id="send-amount"
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="text-lg sm:text-xl font-bold h-10 sm:h-12 pr-14 sm:pr-16 border-[#6667AB] focus:border-[#6667AB] focus:ring-[#6667AB]/20"
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                      <Badge className="bg-[#6667AB]/10 text-[#6667AB] border-none text-xs">
                        USDC
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm text-[#6667AB]">
                    <span className="no-blur">
                      ≈ {sendAmount ? formatCurrency(sendAmount) : '$0.00'}
                    </span>
                    <span className="no-blur">
                      Available: {usdcBalance ? Number(formatUnits(usdcBalance.value, 6)).toFixed(2) : '0.00'} USDC
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("10")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("50")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("100")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (usdcBalance) {
                        setSendAmount(formatUnits(usdcBalance.value, 6));
                      }
                    }}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    Max
                  </Button>
                </div>

                <Button
                  onClick={handleSendUSDC}
                  disabled={!sendAmount || !sendToAddress || !isAddressValid || isSending || isConfirming || parseFloat(sendAmount) <= 0}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white h-10 sm:h-12 text-sm sm:text-lg font-semibold"
                >
                  {isSending || isConfirming ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  )}
                  {isSending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Send USDC'}
                </Button>

                {/* Transaction Status */}
                {isConfirmed && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ USDC sent successfully! Your transaction has been confirmed on the Base network.
                      <Button
                        variant="link"
                        className="p-0 ml-2 text-green-600"
                        onClick={() => window.open(`https://basescan.org/tx/${sendHash}`, '_blank')}
                      >
                        View Transaction <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {isFailed && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      ❌ Transaction failed. This could be due to insufficient balance, network issues, or user cancellation. Please check your wallet and try again.
                    </AlertDescription>
                  </Alert>
                )}

                {(isSending || isConfirming) && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    <AlertDescription className="text-blue-800">
                      {isSending ? '⏳ Please confirm the transaction in your wallet...' : '🔄 Transaction is being processed on the Base network...'}
                    </AlertDescription>
                  </Alert>
                )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receive Tab Content */}
            <TabsContent value="receive" className="mt-0">
              <Card className="border-2 border-[#6667AB]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#6667AB]/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-black">Receive USDC</CardTitle>
                      <p className="text-sm text-[#6667AB]">Share your address or QR code</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                <div className="text-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-xl mx-auto mb-4 sm:mb-6 flex items-center justify-center border-2 border-[#6667AB]/20 p-3">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code for wallet address" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-[#6667AB]" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6667AB] mb-3 no-blur">Your Base Network Address</p>
                  <div className="bg-[#6667AB]/5 rounded-lg p-3 border border-[#6667AB]/20">
                    <p className="font-mono text-xs text-black mb-3 break-all no-blur px-1">
                      {address}
                    </p>
                    <Button
                      onClick={copyAddressToClipboard}
                      className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white text-sm py-2"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      )}
                      {copiedAddress ? 'Copied!' : 'Copy Address'}
                    </Button>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Important:</strong> Only send USDC on Base network to this address. 
                    Sending tokens from other networks may result in loss of funds.
                  </AlertDescription>
                </Alert>


                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Collapsible Design */}
        <div className="hidden sm:block space-y-6">
          {/* Send USDC Section */}
          <Collapsible open={sendExpanded} onOpenChange={setSendExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto border-2 border-[#6667AB]/20 hover:border-[#6667AB] transition-all duration-300 rounded-xl bg-gradient-to-r from-white to-[#6667AB]/5 hover:shadow-md"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#6667AB] to-[#6667AB]/80 rounded-full flex items-center justify-center shadow-lg">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base text-black">Send USDC</div>
                    <div className="text-xs sm:text-sm text-[#6667AB]">Transfer USDC to any Base address</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 px-2 py-1 font-medium text-xs">
                    Instant
                  </Badge>
                  {sendExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#6667AB]" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#6667AB]" />}
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4 sm:mt-6">
              <Card className="border-2 border-[#6667AB]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#6667AB]/5">
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">

                {/* KYC/KYB Mandatory Notice */}
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>KYC/KYB Required:</strong> For compliance with financial regulations, identity verification is mandatory for all USDC transfers. Please complete KYC (individuals) or KYB (businesses) before proceeding with transactions.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="recipient-address-desktop" className="text-xs sm:text-sm font-medium text-black">
                    Recipient Address
                  </Label>
                  <Input
                    id="recipient-address-desktop"
                    placeholder="0x... (Base network address)"
                    value={sendToAddress}
                    onChange={(e) => setSendToAddress(e.target.value)}
                    className={`h-10 sm:h-12 text-sm ${!isAddressValid ? 'border-red-500 focus:border-red-500' : 'border-[#6667AB] focus:border-[#6667AB]'} focus:ring-[#6667AB]/20`}
                  />
                  {!isAddressValid && sendToAddress && (
                    <p className="text-xs sm:text-sm text-red-600 no-blur">Please enter a valid Ethereum address</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send-amount-desktop" className="text-xs sm:text-sm font-medium text-black">
                    Amount (USDC)
                  </Label>
                  <div className="relative">
                    <Input
                      id="send-amount-desktop"
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="text-lg sm:text-xl font-bold h-10 sm:h-12 pr-14 sm:pr-16 border-[#6667AB] focus:border-[#6667AB] focus:ring-[#6667AB]/20"
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                      <Badge className="bg-[#6667AB]/10 text-[#6667AB] border-none text-xs">
                        USDC
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm text-[#6667AB]">
                    <span className="no-blur">
                      ≈ {sendAmount ? formatCurrency(sendAmount) : '$0.00'}
                    </span>
                    <span className="no-blur">
                      Available: {usdcBalance ? Number(formatUnits(usdcBalance.value, 6)).toFixed(2) : '0.00'} USDC
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("10")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("50")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendAmount("100")}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    $100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (usdcBalance) {
                        setSendAmount(formatUnits(usdcBalance.value, 6));
                      }
                    }}
                    className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs sm:text-sm h-8"
                  >
                    Max
                  </Button>
                </div>

                <Button
                  onClick={handleSendUSDC}
                  disabled={!sendAmount || !sendToAddress || !isAddressValid || isSending || isConfirming || parseFloat(sendAmount) <= 0}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white h-10 sm:h-12 text-sm sm:text-lg font-semibold"
                >
                  {isSending || isConfirming ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  )}
                  {isSending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Send USDC'}
                </Button>

                {/* Transaction Status */}
                {isConfirmed && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ USDC sent successfully! Your transaction has been confirmed on the Base network.
                      <Button
                        variant="link"
                        className="p-0 ml-2 text-green-600"
                        onClick={() => window.open(`https://basescan.org/tx/${sendHash}`, '_blank')}
                      >
                        View Transaction <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {isFailed && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      ❌ Transaction failed. This could be due to insufficient balance, network issues, or user cancellation. Please check your wallet and try again.
                    </AlertDescription>
                  </Alert>
                )}

                {(isSending || isConfirming) && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    <AlertDescription className="text-blue-800">
                      {isSending ? '⏳ Please confirm the transaction in your wallet...' : '🔄 Transaction is being processed on the Base network...'}
                    </AlertDescription>
                  </Alert>
                )}                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Receive USDC Section */}
          <Collapsible open={receiveExpanded} onOpenChange={setReceiveExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto border-2 border-[#6667AB]/20 hover:border-[#6667AB] transition-all duration-300 rounded-xl bg-gradient-to-r from-white to-[#6667AB]/5 hover:shadow-md"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base text-black">Receive USDC</div>
                    <div className="text-xs sm:text-sm text-[#6667AB]">Share your address or QR code</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 px-2 py-1 font-medium text-xs">
                    QR Code
                  </Badge>
                  {receiveExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#6667AB]" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#6667AB]" />}
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4 sm:mt-6">
              <Card className="border-2 border-[#6667AB]/20 rounded-2xl shadow-lg bg-gradient-to-br from-white to-[#6667AB]/5">
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="text-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-xl mx-auto mb-4 sm:mb-6 flex items-center justify-center border-2 border-[#6667AB]/20 p-3">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code for wallet address" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-[#6667AB]" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#6667AB] mb-3 no-blur">Your Base Network Address</p>
                  <div className="bg-[#6667AB]/5 rounded-lg p-3 border border-[#6667AB]/20">
                    <p className="font-mono text-xs text-black mb-3 break-all no-blur px-1">
                      {address}
                    </p>
                    <Button
                      onClick={copyAddressToClipboard}
                      className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white text-sm py-2"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      )}
                      {copiedAddress ? 'Copied!' : 'Copy Address'}
                    </Button>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Important:</strong> Only send USDC on Base network to this address. 
                    Sending tokens from other networks may result in loss of funds.
                  </AlertDescription>
                </Alert>


                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Transaction History */}
        {transactionHistory.length > 0 && (
          <Card className="mt-6 sm:mt-8 border-[#6667AB]/20 bg-white shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-black no-blur">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {transactionHistory.slice(0, 5).map((tx, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#6667AB]/5 rounded-lg gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {tx.type === 'send' ? (
                          <Send className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        ) : (
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-black no-blur text-sm sm:text-base truncate">
                          {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} USDC
                        </p>
                        <p className="text-xs sm:text-sm text-[#6667AB] no-blur truncate">
                          {tx.type === 'send' ? 'To' : 'From'}: {formatAddress(tx.address)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <Badge className={`${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      } border-none text-xs`}>
                        {tx.status}
                      </Badge>
                      <p className="text-xs text-[#6667AB] mt-1 no-blur">
                        {tx.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}