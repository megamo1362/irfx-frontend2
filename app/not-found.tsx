'use client';

import Link from 'next/link';
import { useLang } from '@/app/i18n/LangContext';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-[120px] leading-none font-bold gradient-text-cyber opacity-50 select-none">
        404
      </div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">
        {t.not_found_title}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-xs">
        {t.not_found_desc}
      </p>
      <Link href="/admin" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium ml-3">
        {t.not_found_admin}
      </Link>
      <Link href="/dashboard" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium opacity-60 mt-3">
        {t.not_found_dashboard}
      </Link>
    </div>
  );
}
