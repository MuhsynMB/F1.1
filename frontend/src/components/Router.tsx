import React, { useEffect, useState } from 'react';

export type PageType = 'home' | 'vendor' | 'orders' | 'disputes';

interface RouterProps {
  children: React.ReactNode;
}

const Router: React.FC<RouterProps> = ({ children }) => {
  useEffect(() => {
    const handlePopState = () => {
      // Re-render on navigation
      window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('locationchange'));
  };

  // Make navigate function available globally
  (window as any).navigate = navigate;

  return <>{children}</>;
};

export const useRouter = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('locationchange'));
  };

  const getCurrentPage = (): PageType => {
    switch (currentPath) {
      case '/RegVen':
        return 'vendor';
      case '/orders':
        return 'orders';
      case '/disputes':
        return 'disputes';
        case '/marketplace':
        return 'home';
      default:
        return 'home';
    }
  };

  return {
    currentPath,
    currentPage: getCurrentPage(),
    navigate
  };
};

export default Router;
