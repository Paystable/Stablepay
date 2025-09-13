import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { Button } from "./ui/button";
import {
  Wallet,
  RefreshCw
} from "lucide-react";
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

export default function WalletConnection() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [location, navigate] = useLocation();
  const [showTravelRuleCompliance, setShowTravelRuleCompliance] = useState(false);
  const [isNewWallet, setIsNewWallet] = useState(false);

  // Check if wallet is new and handle Travel Rule compliance
  useEffect(() => {
    if (isConnected && address) {
      checkIfNewWallet();
    } else {
      // Reset states when disconnected
      setIsNewWallet(false);
      setShowTravelRuleCompliance(false);
    }
  }, [isConnected, address]);

  const checkIfNewWallet = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/travel-rule/wallet-status/${address}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Wallet status check:', data);

        // Show travel rule compliance for new wallets that haven't completed it
        if (data.isNewWallet && !data.hasCompliance) {
          setIsNewWallet(true);
          setShowTravelRuleCompliance(true);
        } else {
          setIsNewWallet(false);
          setShowTravelRuleCompliance(false);
        }
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      // On error, don't show travel rule to avoid blocking users
      setIsNewWallet(false);
      setShowTravelRuleCompliance(false);
    }
  };

  const handleConnect = async () => {
    try {
      connect({
        connector: coinbaseWallet({
          appName: 'StablePay',
          appLogoUrl: '/stablepay-logo.png'
        })
      });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleTravelRuleComplete = async (originatorInfo: any) => {
    setShowTravelRuleCompliance(false);
    setIsNewWallet(false);

    // Mark wallet as processed
    try {
      await fetch('/api/travel-rule/wallet-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address })
      });
    } catch (error) {
      console.error('Error marking wallet as processed:', error);
    }

    // Navigate to dashboard
    if (location !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  const handleTravelRuleSkip = async () => {
    setShowTravelRuleCompliance(false);
    setIsNewWallet(false);

    // Mark wallet as processed but without compliance data
    try {
      await fetch('/api/travel-rule/wallet-processed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, skipped: true })
      });
    } catch (error) {
      console.error('Error marking wallet as processed:', error);
    }

    // Navigate to dashboard
    if (location !== '/dashboard') {
      navigate('/dashboard');
    }
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={() => {
          disconnect();
          navigate('/');
        }}
        variant="outline"
        className="border-2 border-[#6667AB]/30 text-[#6667AB] hover:bg-[#6667AB]/10 font-semibold px-8 py-3"
      >
        Disconnect Wallet
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white font-semibold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-0"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5 mr-3" />
            Connect Wallet
          </>
        )}
      </Button>

      {/* Travel Rule Compliance Modal - Component removed */}
    </>
  );
}