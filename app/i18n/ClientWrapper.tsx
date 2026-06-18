'use client';

import { useEffect } from 'react';
import { useLang } from './LangContext';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  }, [lang]);

  return <>{children}</>;
}
