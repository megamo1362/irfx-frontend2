'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BookOpen, TrendingUp, Users, LayoutDashboard, KeyRound, CreditCard, UserCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/app/i18n/LangContext';
import type { User } from '@/types';
import type { Translations } from '@/app/i18n/translations';

interface NavItem {
  href: string;
  labelKey: keyof Translations;
  icon: LucideIcon;
  exact?: boolean;
  roles?: Array<User['role']>;
}

const DASHBOARD_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav_accounts', icon: BarChart2, exact: true },
  { href: '/dashboard/journal', labelKey: 'nav_journal', icon: BookOpen },
  { href: '/dashboard/journal/analysis', labelKey: 'nav_analysis', icon: TrendingUp, roles: ['client'] },
  { href: '/dashboard/coach/clients', labelKey: 'nav_my_clients', icon: Users, roles: ['coach'] },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin', labelKey: 'nav_admin_dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', labelKey: 'nav_admin_users', icon: Users },
  { href: '/admin/coaches', labelKey: 'nav_admin_coaches', icon: UserCheck },
  { href: '/admin/invite-codes', labelKey: 'nav_admin_codes', icon: KeyRound },
  { href: '/admin/plans', labelKey: 'nav_admin_plans', icon: CreditCard },
];

interface BottomNavProps {
  user: User;
  variant?: 'dashboard' | 'admin';
}

export function BottomNav({ user, variant = 'dashboard' }: BottomNavProps) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLang();
  const allItems = variant === 'admin' ? ADMIN_ITEMS : DASHBOARD_ITEMS;
  const items = allItems.filter(item => !item.roles || item.roles.includes(user.role));

  const matches = items.filter(item => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  });
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="absolute inset-0 bg-[var(--color-deep)]/95 backdrop-blur-md border-t border-[var(--color-border)]" />
      <div className="relative flex items-center justify-around h-16">
        {items.map(item => {
          const active = activeHref === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                active ? 'text-[var(--color-cyan)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                active ? 'bg-[var(--color-cyan-dim)]' : ''
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${
                active ? 'text-[var(--color-cyan)]' : 'text-[var(--color-text-muted)]'
              }`}>
                {t[item.labelKey] as string}
              </span>
            </Link>
          );
        })}

        {/* Language toggle tab */}
        <button
          onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-[var(--color-text-muted)] transition-colors"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl">
            <Globe className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium leading-none">
            {lang === 'fa' ? 'EN' : t.lang_fa_short}
          </span>
        </button>
      </div>
    </nav>
  );
}
