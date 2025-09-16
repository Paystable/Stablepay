/**
 * Google Analytics Provider Component
 * Provides Google Analytics context and automatic tracking
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useGoogleAnalytics, UseGoogleAnalyticsReturn } from '@/hooks/use-google-analytics';

type GoogleAnalyticsContextType = UseGoogleAnalyticsReturn;

const GoogleAnalyticsContext = createContext<GoogleAnalyticsContextType | null>(null);

interface GoogleAnalyticsProviderProps {
  children: ReactNode;
}

export function GoogleAnalyticsProvider({ children }: GoogleAnalyticsProviderProps) {
  const analytics = useGoogleAnalytics();
  const [location] = useLocation();

  // Track page views on route changes
  useEffect(() => {
    const pageTitle = document.title;
    const pagePath = location;
    
    analytics.trackPageView({
      page_title: pageTitle,
      page_path: pagePath,
      custom_parameters: {
        page_category: getPageCategory(location),
        timestamp: new Date().toISOString(),
      },
    });
  }, [location, analytics]);

  // Track user session start
  useEffect(() => {
    analytics.trackEngagement('session_start', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });
  }, [analytics]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analytics.trackEngagement('page_hidden', {
          timestamp: new Date().toISOString(),
        });
      } else {
        analytics.trackEngagement('page_visible', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [analytics]);

  // Track page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      analytics.trackEngagement('session_end', {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [analytics]);

  // Track scroll depth
  useEffect(() => {
    let maxScrollDepth = 0;
    let scrollDepthTracked = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
      }

      // Track milestone scroll depths
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !scrollDepthTracked.has(milestone)) {
          scrollDepthTracked.add(milestone);
          analytics.trackEngagement('scroll_depth', {
            scroll_percentage: milestone,
            page: location,
            timestamp: new Date().toISOString(),
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location, analytics]);

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(event.message, true, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        page: location,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(
        event.reason?.message || 'Unhandled promise rejection',
        true,
        {
          reason: event.reason,
          page: location,
        }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [location, analytics]);

  return (
    <GoogleAnalyticsContext.Provider value={analytics}>
      {children}
    </GoogleAnalyticsContext.Provider>
  );
}

/**
 * Hook to use Google Analytics context
 */
export function useGoogleAnalyticsContext() {
  const context = useContext(GoogleAnalyticsContext);
  if (!context) {
    throw new Error('useGoogleAnalyticsContext must be used within a GoogleAnalyticsProvider');
  }
  return context;
}

/**
 * Helper function to determine page category
 */
function getPageCategory(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/p2p')) return 'p2p';
  if (path.startsWith('/investors')) return 'investors';
  if (path.startsWith('/kyc')) return 'kyc';
  if (path.startsWith('/travel-rule')) return 'compliance';
  if (path.startsWith('/early-access')) return 'early-access';
  if (path.startsWith('/admin-early-access')) return 'admin';
  return 'other';
}

export default GoogleAnalyticsProvider;
