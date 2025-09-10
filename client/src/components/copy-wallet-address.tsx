
import React, { useState } from "react";
import { useAccount } from 'wagmi';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import QRCode from 'qrcode';
import { 
  Copy,
  CheckCircle,
  QrCode,
  Wallet,
  AlertCircle,
  Download
} from "lucide-react";

export default function CopyWalletAddress() {
  const { address, isConnected } = useAccount();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Generate QR code when component mounts
  React.useEffect(() => {
    if (address) {
      QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#6667AB',
          light: '#FFFFFF'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR Code generation failed:', err));
    }
  }, [address]);

  const copyAddressToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg border border-[#6667AB]/20 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl text-black flex items-center">
          <Download className="w-5 h-5 mr-2 text-[#6667AB]" />
          Receive USDC
        </CardTitle>
        <p className="text-sm text-[#6667AB]">
          Share your Base network address to receive USDC
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        {/* QR Code Display */}
        <div className="text-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-xl mx-auto mb-4 sm:mb-6 flex items-center justify-center border-2 border-[#6667AB]/20 p-3 sm:p-4">
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code for wallet address" 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-[#6667AB]" />
            )}
          </div>
          
          {/* Address Display */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#6667AB] font-medium">Your Base Network Address</p>
            <div className="bg-[#6667AB]/5 rounded-lg p-3 sm:p-4 border border-[#6667AB]/20">
              <p className="font-mono text-xs sm:text-sm text-black mb-3 break-all leading-relaxed">
                {address}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={copyAddressToClipboard}
                  className="w-full bg-[#6667AB] hover:bg-[#6667AB]/90 text-white text-sm font-medium h-10 sm:h-12"
                >
                  {copiedAddress ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </Button>
                
                {/* Formatted address for mobile */}
                <div className="sm:hidden">
                  <p className="text-xs text-[#6667AB] font-medium">
                    Short: {formatAddress(address)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Badge */}
        <div className="flex justify-center">
          <Badge className="bg-[#6667AB]/10 text-[#6667AB] border-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Base Network • USDC
          </Badge>
        </div>

        {/* Important Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs sm:text-sm">
            <strong>Important:</strong> Only send USDC on Base network to this address. 
            Sending tokens from other networks may result in loss of funds.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
