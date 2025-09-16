/**
 * Google Analytics Configuration and Utilities
 * Provides comprehensive tracking for the StablePay platform
 */

// Google Analytics 4 Configuration
export interface GAConfig {
  measurementId: string;
  debug?: boolean;
  enabled?: boolean;
}

// Custom event types for StablePay
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Page view tracking
export interface GAPageView {
  page_title: string;
  page_location: string;
  page_path: string;
  custom_parameters?: Record<string, any>;
}

class GoogleAnalytics {
  private config: GAConfig;
  private isInitialized = false;
  private gtag: any = null;

  constructor(config: GAConfig) {
    this.config = {
      enabled: true,
      debug: false,
      ...config,
    };
  }

  /**
   * Initialize Google Analytics
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      // Load Google Analytics script
      await this.loadScript();
      
      // Initialize gtag
      this.gtag = window.gtag;
      
      // Configure Google Analytics
      this.gtag('config', this.config.measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: true,
        allow_google_signals: true,
        allow_ad_personalization_signals: false,
      });

      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('Google Analytics initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  /**
   * Load Google Analytics script dynamically
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      
      script.onload = () => {
        // Initialize gtag function
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Analytics script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Track page view
   */
  trackPageView(pageView: GAPageView): void {
    if (!this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      this.gtag('event', 'page_view', {
        page_title: pageView.page_title,
        page_location: pageView.page_location,
        page_path: pageView.page_path,
        ...pageView.custom_parameters,
      });

      if (this.config.debug) {
        console.log('Page view tracked:', pageView);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(event: GAEvent): void {
    if (!this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      this.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });

      if (this.config.debug) {
        console.log('Event tracked:', event);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'engagement',
      custom_parameters: details,
    });
  }

  /**
   * Track financial transactions
   */
  trackTransaction(action: string, amount?: number, currency: string = 'USDC', details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'transaction',
      value: amount,
      custom_parameters: {
        currency,
        ...details,
      },
    });
  }

  /**
   * Track wallet connections
   */
  trackWalletConnection(walletType: string, success: boolean, error?: string): void {
    this.trackEvent({
      action: success ? 'wallet_connected' : 'wallet_connection_failed',
      category: 'wallet',
      label: walletType,
      custom_parameters: {
        wallet_type: walletType,
        success,
        error: error || null,
      },
    });
  }

  /**
   * Track KYC events
   */
  trackKYC(action: string, step?: string, success?: boolean, error?: string): void {
    this.trackEvent({
      action,
      category: 'kyc',
      label: step,
      custom_parameters: {
        step,
        success,
        error: error || null,
      },
    });
  }

  /**
   * Track vault operations
   */
  trackVaultOperation(action: string, amount?: number, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'vault',
      value: amount,
      custom_parameters: details,
    });
  }

  /**
   * Track P2P operations
   */
  trackP2POperation(action: string, amount?: number, details?: Record<string, any>): void {
    this.trackEvent({
      action,
      category: 'p2p',
      value: amount,
      custom_parameters: details,
    });
  }

  /**
   * Track errors
   */
  trackError(error: string, fatal: boolean = false, details?: Record<string, any>): void {
    this.trackEvent({
      action: 'error',
      category: 'error',
      label: error,
      custom_parameters: {
        fatal,
        error_message: error,
        ...details,
      },
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      this.gtag('config', this.config.measurementId, {
        user_properties: properties,
      });

      if (this.config.debug) {
        console.log('User properties set:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Get current configuration
   */
  getConfig(): GAConfig {
    return { ...this.config };
  }
}

// Create global instance
const gaInstance = new GoogleAnalytics({
  measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-06PZZTESBV',
  debug: import.meta.env.NODE_ENV === 'development',
  enabled: !!(import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-06PZZTESBV'),
});

// Export instance and types
export default gaInstance;
export { GoogleAnalytics };
export type { GAConfig, GAEvent, GAPageView };
