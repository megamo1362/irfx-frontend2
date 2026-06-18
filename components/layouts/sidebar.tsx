'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart2, Users, LayoutDashboard, UserCheck, KeyRound, CreditCard, BookOpen, TrendingUp, Shield, Globe } from 'lucide-react';
import { NavItem } from './nav-item';
import { UserMenu } from './user-menu';
import { cn } from '@/lib/utils';
import { useLang } from '@/app/i18n/LangContext';
import type { User } from '@/types';

interface NavEntry {
  href: string;
  labelKey: keyof ReturnType<typeof useLang>['t'];
  icon: LucideIcon;
  exact?: boolean;
  roles?: Array<User['role']>;
}

const DASHBOARD_NAV: NavEntry[] = [
  { href: '/dashboard', labelKey: 'nav_accounts', icon: BarChart2, exact: true },
  { href: '/dashboard/journal', labelKey: 'nav_journal', icon: BookOpen },
  { href: '/dashboard/journal/analysis', labelKey: 'nav_journal_analysis', icon: TrendingUp, roles: ['client'] },
  { href: '/dashboard/settings/journal-permissions', labelKey: 'nav_coach_access', icon: Shield, roles: ['client'] },
  { href: '/dashboard/coach/clients', labelKey: 'nav_my_clients', icon: Users, roles: ['coach'] },
];

const ADMIN_NAV: NavEntry[] = [
  { href: '/admin', labelKey: 'nav_admin_dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', labelKey: 'nav_admin_users', icon: Users },
  { href: '/admin/coaches', labelKey: 'nav_admin_coaches', icon: UserCheck },
  { href: '/admin/invite-codes', labelKey: 'nav_admin_invite_codes', icon: KeyRound },
  { href: '/admin/plans', labelKey: 'nav_admin_plans', icon: CreditCard },
];

interface SidebarProps {
  user: User;
  variant?: 'dashboard' | 'admin';
  onNavClick?: () => void;
  className?: string;
}

export function Sidebar({ user, variant = 'dashboard', onNavClick, className }: SidebarProps) {
  const { t, lang, setLang, isRTL } = useLang();
  const navItems = variant === 'admin' ? ADMIN_NAV : DASHBOARD_NAV;
  const visibleItems = navItems.filter((item) =>
    !item.roles || item.roles.includes(user.role),
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-[280px] bg-[var(--color-deep)]',
        isRTL ? 'border-l border-[var(--color-border)]' : 'border-r border-[var(--color-border)]',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[var(--color-border)]">
        <Link href={variant === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Zenvora" className="h-14 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={t[item.labelKey] as string}
            icon={item.icon}
            exact={item.exact}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Language switcher */}
      <div className="flex-shrink-0 px-3 pb-2">
        <div className="flex items-center gap-1.5 rounded-xl bg-[rgba(0,0,0,0.25)] border border-[var(--color-border)] p-1">
          <Globe className="w-3.5 h-3.5 text-[var(--color-text-muted)] mx-1 flex-shrink-0" />
          <button
            onClick={() => setLang('fa')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lang === 'fa'
                ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            فارسی
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              lang === 'en'
                ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* User section */}
      <div className="flex-shrink-0 px-3 pb-4">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
