/**
 * React Hook for Google Analytics Integration
 * Provides easy-to-use tracking functions for components
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import gaInstance, { GAEvent, GAPageView } from '@/lib/google-analytics';

export interface UseGoogleAnalyticsReturn {
  trackPageView: (pageView: Omit<GAPageView, 'page_location'>) => void;
  trackEvent: (event: GAEvent) => void;
  trackEngagement: (action: string, details?: Record<string, any>) => void;
  trackTransaction: (action: string, amount?: number, currency?: string, details?: Record<string, any>) => void;
  trackWalletConnection: (walletType: string, success: boolean, error?: string) => void;
  trackKYC: (action: string, step?: string, success?: boolean, error?: string) => void;
  trackVaultOperation: (action: string, amount?: number, details?: Record<string, any>) => void;
  trackP2POperation: (action: string, amount?: number, details?: Record<string, any>) => void;
  trackError: (error: string, fatal?: boolean, details?: Record<string, any>) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  trackFormSubmission: (formName: string, success: boolean, error?: string) => void;
}

/**
 * Hook for Google Analytics tracking
 */
export function useGoogleAnalytics(): UseGoogleAnalyticsReturn {
  const [location] = useLocation();

  // Initialize Google Analytics on mount
  useEffect(() => {
    gaInstance.initialize();
  }, []);

  // Track page views automatically
  useEffect(() => {
    const pageTitle = document.title;
    const pageLocation = window.location.href;
    const pagePath = location;

    gaInstance.trackPageView({
      page_title: pageTitle,
      page_location: pageLocation,
      page_path: pagePath,
      custom_parameters: {
        page_category: getPageCategory(location),
        timestamp: new Date().toISOString(),
      },
    });
  }, [location]);

  // Helper function to determine page category
  const getPageCategory = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/p2p')) return 'p2p';
    if (path.startsWith('/investors')) return 'investors';
    if (path.startsWith('/kyc')) return 'kyc';
    if (path.startsWith('/travel-rule')) return 'compliance';
    if (path.startsWith('/early-access')) return 'early-access';
    if (path.startsWith('/admin-early-access')) return 'admin';
    return 'other';
  };

  // Wrapper functions for easier usage
  const trackPageView = useCallback((pageView: Omit<GAPageView, 'page_location'>) => {
    gaInstance.trackPageView({
      ...pageView,
      page_location: window.location.href,
    });
  }, []);

  const trackEvent = useCallback((event: GAEvent) => {
    gaInstance.trackEvent(event);
  }, []);

  const trackEngagement = useCallback((action: string, details?: Record<string, any>) => {
    gaInstance.trackEngagement(action, details);
  }, []);

  const trackTransaction = useCallback((
    action: string, 
    amount?: number, 
    currency: string = 'USDC', 
    details?: Record<string, any>
  ) => {
    gaInstance.trackTransaction(action, amount, currency, details);
  }, []);

  const trackWalletConnection = useCallback((
    walletType: string, 
    success: boolean, 
    error?: string
  ) => {
    gaInstance.trackWalletConnection(walletType, success, error);
  }, []);

  const trackKYC = useCallback((
    action: string, 
    step?: string, 
    success?: boolean, 
    error?: string
  ) => {
    gaInstance.trackKYC(action, step, success, error);
  }, []);

  const trackVaultOperation = useCallback((
    action: string, 
    amount?: number, 
    details?: Record<string, any>
  ) => {
    gaInstance.trackVaultOperation(action, amount, details);
  }, []);

  const trackP2POperation = useCallback((
    action: string, 
    amount?: number, 
    details?: Record<string, any>
  ) => {
    gaInstance.trackP2POperation(action, amount, details);
  }, []);

  const trackError = useCallback((
    error: string, 
    fatal: boolean = false, 
    details?: Record<string, any>
  ) => {
    gaInstance.trackError(error, fatal, details);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    gaInstance.setUserProperties(properties);
  }, []);

  const trackFormSubmission = useCallback((formName: string, success: boolean, error?: string) => {
    gaInstance.trackEvent({
      action: success ? 'form_submission_success' : 'form_submission_failed',
      category: 'form',
      label: formName,
      custom_parameters: {
        form_name: formName,
        success,
        error: error || null,
      },
    });
  }, []);

  return {
    trackPageView,
    trackEvent,
    trackEngagement,
    trackTransaction,
    trackWalletConnection,
    trackKYC,
    trackVaultOperation,
    trackP2POperation,
    trackError,
    setUserProperties,
    trackFormSubmission,
  };
}

/**
 * Hook for tracking specific user interactions
 */
export function useInteractionTracking() {
  const { trackEngagement } = useGoogleAnalytics();

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackEngagement('button_click', {
      button_name: buttonName,
      location: location || 'unknown',
    });
  }, [trackEngagement]);

  const trackFormSubmission = useCallback((formName: string, success: boolean, error?: string) => {
    trackEngagement('form_submission', {
      form_name: formName,
      success,
      error: error || null,
    });
  }, [trackEngagement]);

  const trackModalOpen = useCallback((modalName: string) => {
    trackEngagement('modal_open', {
      modal_name: modalName,
    });
  }, [trackEngagement]);

  const trackModalClose = useCallback((modalName: string, method: 'button' | 'overlay' | 'escape') => {
    trackEngagement('modal_close', {
      modal_name: modalName,
      close_method: method,
    });
  }, [trackEngagement]);

  const trackTabSwitch = useCallback((tabName: string, tabGroup: string) => {
    trackEngagement('tab_switch', {
      tab_name: tabName,
      tab_group: tabGroup,
    });
  }, [trackEngagement]);

  const trackScroll = useCallback((percentage: number, page: string) => {
    trackEngagement('scroll', {
      scroll_percentage: percentage,
      page,
    });
  }, [trackEngagement]);

  return {
    trackButtonClick,
    trackFormSubmission,
    trackModalOpen,
    trackModalClose,
    trackTabSwitch,
    trackScroll,
  };
}

export default useGoogleAnalytics;
