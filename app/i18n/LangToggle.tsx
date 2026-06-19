'use client';

import { useLang } from './LangContext';
import type { Lang } from './translations';

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[var(--color-border)]">
      {(['en', 'fa'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            lang === l
              ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.2)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
        >
          {l === 'en' ? 'EN' : 'FA'}
        </button>
      ))}
    </div>
  );
}
