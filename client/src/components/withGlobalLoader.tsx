import React, { useEffect } from 'react';
import { useGlobalLoader } from '../hooks/useGlobalLoader';

interface WithGlobalLoaderProps {
  children: React.ReactNode;
  showOnMount?: boolean;
  hideOnMount?: boolean;
  delay?: number;
}

const WithGlobalLoader: React.FC<WithGlobalLoaderProps> = ({
  children,
  showOnMount = false,
  hideOnMount = true,
  delay = 0
}) => {
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    if (showOnMount) {
      showLoader();
    }

    if (hideOnMount) {
      const timer = setTimeout(() => {
        hideLoader();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [showOnMount, hideOnMount, delay, showLoader, hideLoader]);

  return <>{children}</>;
};

export default WithGlobalLoader;
