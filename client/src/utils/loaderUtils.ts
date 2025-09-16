// Utility functions for controlling the global loader

export const showLoader = (text?: string): void => {
  if (typeof window !== 'undefined') {
    if (window.showGlobalLoader) {
      window.showGlobalLoader(text);
    } else {
      window.dispatchEvent(new CustomEvent('show-loader', { detail: { text } }));
    }
  }
};

export const hideLoader = (): void => {
  if (typeof window !== 'undefined') {
    if (window.hideGlobalLoader) {
      window.hideGlobalLoader();
    } else {
      window.dispatchEvent(new CustomEvent('hide-loader'));
    }
  }
};

// Show loader with automatic hide after delay
export const showLoaderWithDelay = (delay: number = 2000): void => {
  showLoader();
  setTimeout(() => {
    hideLoader();
  }, delay);
};

// Show loader during async operations
export const withLoader = async <T>(
  asyncOperation: () => Promise<T>,
  showLoaderFirst: boolean = true
): Promise<T> => {
  if (showLoaderFirst) {
    showLoader();
  }
  
  try {
    const result = await asyncOperation();
    return result;
  } finally {
    hideLoader();
  }
};

// Show loader for navigation
export const navigateWithLoader = (navigate: () => void, delay: number = 300): void => {
  showLoader();
  setTimeout(() => {
    navigate();
    setTimeout(() => {
      hideLoader();
    }, delay);
  }, 100);
};

// Declare global functions for TypeScript
declare global {
  interface Window {
    showGlobalLoader: () => void;
    hideGlobalLoader: () => void;
  }
}
