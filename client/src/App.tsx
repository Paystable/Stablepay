import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import Providers from "@/components/providers";
import GoogleAnalyticsProvider from "@/components/google-analytics-provider";
import PWAInstall from "@/components/pwa-install";
import { Toaster } from "@/components/ui/toaster";
import { PageLoader } from "@/components/page-loader";
import { useLoading } from "@/hooks/use-loading";
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
  const { isLoading, progress, message, startLoading, updateProgress, finishLoading } = useLoading();
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    // Show global loader on route changes
    showLoader();
    
    // Simulate initial app loading
    startLoading("Initializing StablePay...");
    
    const loadingSteps = [
      { progress: 20, message: "Loading blockchain connections..." },
      { progress: 40, message: "Securing your session..." },
      { progress: 60, message: "Fetching market data..." },
      { progress: 80, message: "Preparing interface..." },
      { progress: 100, message: "Ready!" }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < loadingSteps.length) {
        const step = loadingSteps[stepIndex];
        updateProgress(step.progress, step.message);
        stepIndex++;
      } else {
        finishLoading();
        clearInterval(interval);
        // Hide global loader after app is ready
        setTimeout(() => {
          hideLoader();
        }, 500);
        // Start preloading critical pages
        preloadPages();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [showLoader, hideLoader]);

  // Show global loader on route changes
  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location, showLoader, hideLoader]);

  // Page-specific loading messages
  const getPageLoadingMessage = (path: string) => {
    switch (path) {
      case "/dashboard": return "Loading your portfolio...";
      case "/p2p": return "Connecting to P2P network...";
      case "/investors": return "Loading investor information...";
      case "/kyc": return "Loading KYC verification...";
      case "/travel-rule": return "Loading compliance forms...";
      case "/early-access": return "Loading early access forms...";
      case "/admin-early-access": return "Loading admin dashboard...";
      default: return "Loading StablePay...";
    }
  };

  return (
    <div className="min-h-screen">
      <PageLoader 
        isLoading={isLoading} 
        progress={progress} 
        message={message}
        variant="rainbow"
      />
      
      <Suspense fallback={
        <PageLoader 
          isLoading={true} 
          progress={75} 
          message={getPageLoadingMessage(location)}
          variant="default"
        />
      }>
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