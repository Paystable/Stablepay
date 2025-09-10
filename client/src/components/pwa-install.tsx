
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-[#6667AB] bg-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-black text-sm no-blur">
                Install Stable Pay
              </h3>
              <p className="text-xs text-[#6667AB] mt-1 no-blur">
                Get quick access to your portfolio and earn up to 14% APY anywhere
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-[#6667AB] hover:bg-[#6667AB]/10 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-[#6667AB] hover:bg-[#6667AB]/90 text-white flex-1 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Install App
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="border-[#6667AB] text-[#6667AB] hover:bg-[#6667AB]/10 text-xs"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
