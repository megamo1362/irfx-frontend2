import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  label?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingScreen({
  label = 'در حال بارگذاری...',
  fullPage = true,
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5',
        fullPage && 'fixed inset-0 z-50 circuit-bg',
        !fullPage && 'w-full h-64',
        className,
      )}
    >
      <img src="/logo.png" alt="Zenvora" className="h-16 w-auto object-contain" />
      <Spinner size="lg" />
      {label && (
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse">{label}</p>
      )}
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-[var(--color-text-muted)]">
      <Spinner size="md" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
