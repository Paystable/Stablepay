import { useEffect, useCallback } from 'react';

interface UseGlobalLoaderReturn {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
}

export const useGlobalLoader = (): UseGlobalLoaderReturn => {
  const showLoader = useCallback((text?: string) => {
    if (typeof window !== 'undefined') {
      // Try to use the global function first
      if (window.showGlobalLoader) {
        window.showGlobalLoader(text);
      } else {
        // Fallback to custom event
        window.dispatchEvent(new CustomEvent('show-loader', { detail: { text } }));
      }
    }
  }, []);

  const hideLoader = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Try to use the global function first
      if (window.hideGlobalLoader) {
        window.hideGlobalLoader();
      } else {
        // Fallback to custom event
        window.dispatchEvent(new CustomEvent('hide-loader'));
      }
    }
  }, []);

  return {
    showLoader,
    hideLoader,
    isLoading: false // This would need to be managed by a global state if needed
  };
};

// Global loader utility functions
export const showGlobalLoader = (): void => {
  if (typeof window !== 'undefined') {
    if (window.showGlobalLoader) {
      window.showGlobalLoader();
    } else {
      window.dispatchEvent(new CustomEvent('show-loader'));
    }
  }
};

export const hideGlobalLoader = (): void => {
  if (typeof window !== 'undefined') {
    if (window.hideGlobalLoader) {
      window.hideGlobalLoader();
    } else {
      window.dispatchEvent(new CustomEvent('hide-loader'));
    }
  }
};

// Declare global functions for TypeScript
declare global {
  interface Window {
    showGlobalLoader: () => void;
    hideGlobalLoader: () => void;
  }
}
