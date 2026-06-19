'use client';

import { useEffect } from 'react';
import { useLang } from './LangContext';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { lang, isRTL } = useLang();

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [lang, isRTL]);

  return <>{children}</>;
}
