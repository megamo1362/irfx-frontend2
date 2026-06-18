'use client';

import { useEffect } from 'react';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);

  return <>{children}</>;
}
