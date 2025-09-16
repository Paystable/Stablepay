import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WalletConnection from "@/components/wallet-connection";
import CoinbaseOnramp from "@/components/coinbase-onramp";
import { Menu, X, Home, BarChart3, Wallet, Shield, TrendingUp, Users, Calculator, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAccount, useDisconnect } from 'wagmi';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Smooth scroll handler for anchor links
  const handleAnchorClick = (href: string, e?: React.MouseEvent) => {
    if (href.startsWith('/#')) {
      e?.preventDefault();
      const targetId = href.substring(2); // Remove '/#'
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const navHeight = 128; // Account for fixed navigation height (lg:h-32 = 128px)
        const elementPosition = targetElement.offsetTop;
        const offsetPosition = elementPosition - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsMenuOpen(false); // Close mobile menu if open
    } else if (href !== location) {
      setIsMenuOpen(false); // Close mobile menu when navigating to different page
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#remittance-calculator", label: "Calculator", icon: Calculator },
    { href: "/#arbitrage", label: "Arbitrage Vault", icon: Wallet },
    { href: "/#features", label: "Features", icon: Shield },
    { href: "/#comparison", label: "Comparison", icon: TrendingUp },
    { href: "/#audiences", label: "For You", icon: Users },
    { href: "/early-access", label: "Early Access", icon: Star },
    // Dashboard hidden for early access mode
    // { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#6667AB]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36">
            {/* Logo */}
            <Link href="/" className="flex items-center cursor-pointer">
              <div className="flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="StablePay Logo" 
                  className="h-20 w-auto sm:h-24 sm:w-auto md:h-28 md:w-auto lg:h-32 lg:w-auto xl:h-36 xl:w-auto object-contain"
                />
              </div>
            </Link>





            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    size="sm"
                    className={
                      location === item.href
                        ? "bg-[#6667AB] text-white hover:bg-[#6667AB]/90 text-sm px-3 py-2 h-9 rounded-lg font-medium"
                        : "text-[#6667AB] hover:bg-[#6667AB]/10 text-sm px-3 py-2 h-9 rounded-lg font-medium"
                    }
                    onClick={(e) => handleAnchorClick(item.href, e)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {isConnected && (
                <div className="flex items-center space-x-2 ml-4">
                  <CoinbaseOnramp isOpen={false} onClose={() => {}} />
                </div>
              )}
            </div>

            {/* Medium Screen Navigation - Simplified */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {navItems.slice(0, 5).map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    size="sm"
                    className={
                      location === item.href
                        ? "bg-[#6667AB] text-white hover:bg-[#6667AB]/90 text-xs px-2 py-2 h-8 rounded-md"
                        : "text-[#6667AB] hover:bg-[#6667AB]/10 text-xs px-2 py-2 h-8 rounded-md"
                    }
                    onClick={(e) => handleAnchorClick(item.href, e)}
                  >
                    <item.icon className="w-3 h-3" />
                    <span className="hidden xl:inline ml-1">{item.label}</span>
                  </Button>
                </Link>
              ))}
              {isConnected && (
                <div className="flex items-center space-x-2 ml-2">
                  <CoinbaseOnramp isOpen={false} onClose={() => {}} />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {isConnected && <CoinbaseOnramp isOpen={false} onClose={() => {}} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="text-[#6667AB] hover:bg-[#6667AB]/10"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#6667AB]/20 bg-[#FAF9F6]/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      location === item.href
                        ? "bg-[#6667AB] text-white hover:bg-[#6667AB]/90"
                        : "text-[#6667AB] hover:bg-[#6667AB]/10"
                    }`}
                    onClick={(e) => handleAnchorClick(item.href, e)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {isConnected && (
                <div className="pt-2 space-y-2">
                  <CoinbaseOnramp isOpen={false} onClose={() => {}} />
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 mb-4" />
    </>
  );
}