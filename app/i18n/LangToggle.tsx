'use client';

import { useLang } from './LangContext';

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-[var(--color-cyan)] text-[var(--color-void)] font-black text-sm shadow-lg hover:scale-110 transition-transform select-none"
      title={lang === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}
    >
      {lang === 'fa' ? 'EN' : 'FA'}
    </button>
  );
}
