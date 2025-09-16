import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import Providers from "@/components/providers";
import GoogleAnalyticsProvider from "@/components/google-analytics-provider";
import PWAInstall from "@/components/pwa-install";
import { Toaster } from "@/components/ui/toaster";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import WithGlobalLoader from "@/components/withGlobalLoader";

// Lazy load pages for better performance with preloading
const HomePage = lazy(() => import("@/pages/home"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const P2PPage = lazy(() => import("@/pages/p2p"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));
const InvestorsPage = lazy(() => import("@/pages/investors"));
const KYCPage = lazy(() => import("./pages/kyc"));
const TravelRulePage = lazy(() => import("./pages/travel-rule"));
const EarlyAccessPage = lazy(() => import("./pages/early-access"));
const AdminEarlyAccessPage = lazy(() => import("./pages/admin-early-access"));

// Preload critical pages
const preloadPages = () => {
  // Preload critical pages after initial load
  setTimeout(() => {
    import("@/pages/dashboard");
    import("@/pages/early-access");
  }, 2000);
};

function AppContent() {
  const [location] = useLocation();
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    // Show global loader on route changes
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location, showLoader, hideLoader]);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6A5ACD] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/p2p" component={P2PPage} />
          <Route path="/investors" component={InvestorsPage} />
          <Route path="/kyc" component={KYCPage} />
          <Route path="/travel-rule" component={TravelRulePage} />
          <Route path="/early-access" component={EarlyAccessPage} />
          <Route path="/admin-early-access" component={AdminEarlyAccessPage} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
      </Suspense>
      
      <PWAInstall />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <WithGlobalLoader showOnMount={true} hideOnMount={true} delay={1000}>
      <Providers>
        <GoogleAnalyticsProvider>
          <AppContent />
        </GoogleAnalyticsProvider>
      </Providers>
    </WithGlobalLoader>
  );
}