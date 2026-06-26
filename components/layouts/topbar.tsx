'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { useUiStore } from '@/store/ui';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLang } from '@/app/i18n/LangContext';
import type { User } from '@/types';

interface TopbarProps {
  user: User;
  className?: string;
}

export function Topbar({ user, className }: TopbarProps) {
  const { openMobileSidebar } = useUiStore();
  const { t } = useLang();
  const displayName = user.full_name || user.email;
  const initials = getInitials(displayName);

  const roleLabels: Record<string, string> = {
    admin: t.role_admin,
    coach: t.role_coach,
    client: t.role_client,
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between',
        'h-16 px-4 md:px-6',
        'bg-[var(--color-deep)]/80 backdrop-blur-md',
        'border-b border-[var(--color-border)]',
        className,
      )}
    >
      {/* Hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Image src="/logo-dashboard-dark.png" alt="MINDLURA" width={120} height={32} className="lg:hidden h-8 w-auto object-contain dark:block hidden" priority />
        <Image src="/logo-dashboard-light.png" alt="MINDLURA" width={120} height={32} className="lg:hidden h-8 w-auto object-contain dark:hidden block" priority />
      </div>

      {/* Right side: notifications + user avatar */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[var(--color-cyan)] ring-2 ring-[var(--color-deep)]" />
        </button>

        <Link href="/dashboard/profile" className="flex items-center gap-2.5 pl-3 border-r border-[var(--color-border)] hover:opacity-80 transition-opacity">
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-none">{displayName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{roleLabels[user.role]}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-purple)] via-[var(--color-blue)] to-[var(--color-cyan)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}
