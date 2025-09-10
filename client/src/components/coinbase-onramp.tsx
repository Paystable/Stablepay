import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Copy, QrCode, X, CreditCard, Wallet } from 'lucide-react';
import QRCode from 'qrcode';

interface CoinbaseOnrampProps {
  isOpen: boolean;
  onClose: () => void;
  destinationWallet?: string;
}

export default function CoinbaseOnramp({ isOpen, onClose, destinationWallet }: CoinbaseOnrampProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'buy' | 'receive'>('buy');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (isOpen && destinationWallet) {
      generateSessionToken();
      generateQRCode();
    }
  }, [isOpen, destinationWallet]);

  const generateQRCode = async () => {
    if (destinationWallet) {
      try {
        const url = await QRCode.toDataURL(destinationWallet, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(url);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    }
  };

  const generateSessionToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/coinbase/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationWallet: destinationWallet || '0x742d35Cc6634C0532925a3b8D1a8a6f8e8a2D3F0'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionToken(data.sessionToken);
      } else {
        console.error('Failed to generate session token');
      }
    } catch (error) {
      console.error('Error generating session token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddressToClipboard = async () => {
    if (destinationWallet) {
      await navigator.clipboard.writeText(destinationWallet);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto p-0 overflow-hidden h-[90vh] max-h-[800px] sm:h-auto sm:max-h-[700px]">
        <div className="relative w-full h-full flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white/90 h-8 w-8 sm:h-10 sm:w-10 sm:top-4 sm:right-4"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold text-black">Get USDC</DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 p-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'buy' | 'receive')} className="w-full h-full">
              <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-[#6667AB]/20 rounded-2xl p-1 mb-6">
                <TabsTrigger
                  value="buy"
                  className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-sm font-medium rounded-xl py-3"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy USDC
                </TabsTrigger>
                <TabsTrigger
                  value="receive"
                  className="data-[state=active]:bg-[#6667AB] data-[state=active]:text-white text-[#6667AB] hover:bg-[#6667AB]/10 text-sm font-medium rounded-xl py-3"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Receive USDC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="h-full mt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8 h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6667AB]"></div>
                  </div>
                ) : sessionToken ? (
                  <div className="h-full min-h-[400px]">
                    <iframe
                      src={`https://pay.coinbase.com/buy/select-asset?sessionToken=${sessionToken}&theme=light`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      className="w-full h-full rounded-lg"
                      style={{ border: 'none' }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-base mb-4">Failed to load Coinbase Pay. Please try again.</p>
                    <Button onClick={generateSessionToken} className="bg-[#6667AB] hover:bg-[#6667AB]/90 text-white">
                      Retry
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="receive" className="space-y-6 mt-0">
                <div className="text-center space-y-6">
                  <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-[#6667AB]/20 p-4">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code for wallet address" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <QrCode className="w-20 h-20 text-[#6667AB]" />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-[#6667AB] font-medium">Your Base Network Address</p>
                    <div className="bg-[#6667AB]/5 rounded-lg p-4 border border-[#6667AB]/20">
                      <p className="font-mono text-sm text-black mb-3 break-all">
                        {destinationWallet}
                      </p>
                      <Button
                        onClick={copyAddressToClipboard}
                        className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white"
                      >
                        {copiedAddress ? (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Address
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-blue-800 mb-1">Important</p>
                        <p className="text-xs text-blue-700">
                          Only send USDC on Base network to this address. Sending tokens from other networks may result in loss of funds.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-[#6667AB]/10 text-[#6667AB] border-none px-4 py-2">
                    Base Network • USDC
                  </Badge>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}