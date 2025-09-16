import { Route, Switch, useLocation } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import Providers from "@/components/providers";
import GoogleAnalyticsProvider from "@/components/google-analytics-provider";
import PWAInstall from "@/components/pwa-install";
import { Toaster } from "@/components/ui/toaster";

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

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
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
    <Providers>
      <GoogleAnalyticsProvider>
        <AppContent />
      </GoogleAnalyticsProvider>
    </Providers>
  );
}