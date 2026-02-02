import { useEffect, useState } from 'react';

export interface AppLocation {
  pathname: string;
  search: string;
  hash: string;
}

export const navigate = (to: string) => {
  if (typeof window === 'undefined') return;
  const next = to.startsWith('/') ? to : `/${to}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (current === next) return;
  window.history.pushState({}, '', next);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const useLocation = (): AppLocation => {
  const [location, setLocation] = useState<AppLocation>(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }));

  useEffect(() => {
    const handleChange = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  return location;
};
