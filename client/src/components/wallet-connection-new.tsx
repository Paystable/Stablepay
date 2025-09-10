'use client';

import React from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance
} from 'wagmi';
import { Button } from "./ui/button";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balance } = useBalance({
    address
  });

  const handleConnect = async () => {
    try {
      // Use the first available connector (usually injected like MetaMask)
      const connector = connectors[0];
      await connectAsync({ connector });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!isConnected ? (
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleConnect}
            className="w-full gradient-primary hover:opacity-90 text-white"
            size="lg"
          >
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Connected Account</span>
                <span className="text-xs text-muted-foreground">{address}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-foreground hover:text-primary"
              >
                Disconnect
              </Button>
            </div>
            {balance && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground">Balance</span>
                <p className="text-sm font-medium text-foreground">
                  {`${Number(balance.formatted).toFixed(4)} ${balance.symbol}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
