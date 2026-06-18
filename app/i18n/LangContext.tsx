'use client';

import { createContext, useContext } from 'react';
import { translations } from './translations';
import type { Translations } from './translations';

interface LangCtx {
  lang: 'en';
  setLang: (l: 'en') => void;
  t: Translations;
  isRTL: false;
}

const ctx: LangCtx = {
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  isRTL: false,
};

const LangContext = createContext<LangCtx>(ctx);

export function LangProvider({ children }: { children: React.ReactNode }) {
  return <LangContext.Provider value={ctx}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
