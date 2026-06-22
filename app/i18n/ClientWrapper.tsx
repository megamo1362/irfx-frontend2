'use client';

import { useEffect } from 'react';
import { useLang } from './LangContext';
import { useTheme } from './ThemeContext';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { lang, isRTL } = useLang();
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [lang, isRTL]);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
  }, [theme]);

  return <>{children}</>;
}
