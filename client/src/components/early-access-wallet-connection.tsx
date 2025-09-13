import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@coinbase/onchainkit';
import { Button } from "./ui/button";
import {
  Wallet,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WalletSetupFlow from "./wallet-setup-flow";

interface EarlyAccessWalletConnectionProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function EarlyAccessWalletConnection({ 
  onWalletConnected, 
  onWalletDisconnected,
  isSubmitting = false,
  className = ""
}: EarlyAccessWalletConnectionProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [isNewWallet, setIsNewWallet] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [showSetupFlow, setShowSetupFlow] = useState(false);

  // Check if wallet is new and handle status
  useEffect(() => {
    if (isConnected && address) {
      checkWalletStatus();
      onWalletConnected?.(address);
    } else {
      setIsNewWallet(false);
      setWalletStatus('idle');
      onWalletDisconnected?.();
    }
  }, [isConnected, address, onWalletConnected, onWalletDisconnected]);

  const checkWalletStatus = async () => {
    if (!address) return;

    try {
      setWalletStatus('connecting');
      
      // Check if this is a new wallet
      const response = await fetch(`/api/travel-rule/wallet-status/${address}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Wallet status check:', data);
        
        setIsNewWallet(data.isNewWallet || false);
        setWalletStatus('connected');
        
        if (data.isNewWallet) {
          setShowSetupFlow(true);
          toast({
            title: "🎉 New Wallet Detected!",
            description: "Welcome! Let's set up your account for early access.",
          });
        } else {
          onWalletConnected?.(address);
        }
      } else {
        // If API fails, assume it's a new wallet
        setIsNewWallet(true);
        setWalletStatus('connected');
        setShowSetupFlow(true);
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      // On error, assume it's a new wallet and continue
      setIsNewWallet(true);
      setWalletStatus('connected');
      setShowSetupFlow(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletStatus('idle');
    setIsNewWallet(false);
    setShowSetupFlow(false);
    onWalletDisconnected?.();
    
    toast({
      title: "Wallet Disconnected",
      description: "You can reconnect anytime to continue with early access.",
    });
  };

  const handleSetupComplete = (address: string) => {
    setShowSetupFlow(false);
    onWalletConnected?.(address);
    toast({
      title: "🎉 Account Setup Complete!",
      description: "Your wallet is connected and ready for early access submission.",
    });
  };

  const handleSetupSkip = () => {
    setShowSetupFlow(false);
    onWalletConnected?.(address!);
    toast({
      title: "Setup Skipped",
      description: "You can complete setup later. Proceeding with wallet connection.",
    });
  };

  if (isConnected && address) {
    // Show setup flow for new wallets
    if (showSetupFlow) {
      return (
        <WalletSetupFlow
          onSetupComplete={handleSetupComplete}
          onSkip={handleSetupSkip}
          className={className}
        />
      );
    }

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Wallet Connected Status */}
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div className="text-center">
            <div className="font-semibold text-green-800">Wallet Connected</div>
            <div className="text-sm text-green-700">
              {address.slice(0, 8)}...{address.slice(-6)}
            </div>
            {isNewWallet && (
              <div className="text-xs text-green-600 mt-1">
                ✨ New wallet detected - ready for early access!
              </div>
            )}
          </div>
        </div>

        {/* Disconnect Button */}
        <Button
          onClick={handleDisconnect}
          disabled={isSubmitting}
          variant="outline"
          className="w-full border-2 border-[#6667AB]/30 text-[#6667AB] hover:bg-[#6667AB]/10 font-semibold py-3"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* OnchainKit Connect Button */}
      <div className="flex justify-center">
        <ConnectButton
          onConnect={() => {
            setWalletStatus('connecting');
            toast({
              title: "Connecting Wallet...",
              description: "Please complete the connection in your wallet.",
            });
          }}
          onDisconnect={() => {
            setWalletStatus('idle');
            onWalletDisconnected?.();
          }}
        />
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          <div className="text-blue-800 font-semibold">Connecting to wallet...</div>
        </div>
      )}

      {walletStatus === 'error' && (
        <div className="flex items-center justify-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="text-red-800 font-semibold">Connection failed. Please try again.</div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-600">
          Connect your wallet to submit your early access request
        </div>
        <div className="text-xs text-gray-500">
          We support Base wallet and other compatible wallets
        </div>
      </div>
    </div>
  );
}
