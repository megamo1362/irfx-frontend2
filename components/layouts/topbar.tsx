'use client';

import { Menu, Bell } from 'lucide-react';
import { useUiStore } from '@/store/ui';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

const roleLabels: Record<string, string> = {
  admin: 'ادمین',
  coach: 'کوچ',
  client: 'کاربر',
};

interface TopbarProps {
  user: User;
  className?: string;
}

export function Topbar({ user, className }: TopbarProps) {
  const { openMobileSidebar } = useUiStore();
  const displayName = user.full_name || user.email;
  const initials = getInitials(displayName);

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
      {/* Right side: hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo on mobile (hidden on desktop where sidebar shows it) */}
        <img src="/logo.png" alt="Zenvora" className="lg:hidden h-8 w-auto object-contain" />
      </div>

      {/* Left side: notifications + user avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[var(--color-cyan)] ring-2 ring-[var(--color-deep)]" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2.5 pl-3 border-r border-[var(--color-border)]">
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-none">{displayName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{roleLabels[user.role]}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-blue)] flex items-center justify-center text-xs font-bold text-[var(--color-void)] flex-shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
