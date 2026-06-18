'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLang } from './LangContext';

export function LangToggle() {
  const { lang, setLang, isRTL, t } = useLang();
  const [open, setOpen] = useState(false);

  const positionClass = isRTL ? 'right-5' : 'left-5';
  const menuAlignClass = isRTL ? 'right-0' : 'left-0';

  return (
    <div
      className={`fixed bottom-5 ${positionClass} z-50`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Dropdown — pb-2 bridges the gap between menu and button */}
      <div
        className={`absolute bottom-full ${menuAlignClass} pb-2 ${open ? 'block' : 'hidden'}`}
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-xl overflow-hidden min-w-[120px]">
          <button
            onClick={() => { setLang('fa'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-cyan-dim)] ${
              lang === 'fa' ? 'text-[var(--color-cyan)] font-bold' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {lang === 'fa' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] flex-shrink-0" />}
            {t.lang_fa_label}
          </button>
          <button
            onClick={() => { setLang('en'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-cyan-dim)] ${
              lang === 'en' ? 'text-[var(--color-cyan)] font-bold' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {lang === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan)] flex-shrink-0" />}
            English
          </button>
        </div>
      </div>

      {/* Globe button */}
      <button
        className="w-9 h-9 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] text-[var(--color-text-muted)] shadow-lg transition-all flex items-center justify-center"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
      </button>
    </div>
  );
}
