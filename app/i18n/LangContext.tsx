'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';
import type { Lang, Translations } from './translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
  isRTL: boolean;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  isRTL: false,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('irfx_lang') as Lang | null;
    if (saved === 'fa' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('irfx_lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang], isRTL: lang === 'fa' }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
