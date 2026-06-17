'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BookOpen, TrendingUp, Users, UserPlus, LayoutDashboard, KeyRound, CreditCard, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: Array<User['role']>;
}

const DASHBOARD_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'حساب‌ها', icon: BarChart2, exact: true },
  { href: '/dashboard/journal', label: 'ژورنال', icon: BookOpen },
  { href: '/dashboard/journal/analysis', label: 'آنالیز', icon: TrendingUp, roles: ['client'] },
  { href: '/dashboard/connect-coach', label: 'کوچ', icon: UserPlus, roles: ['client'] },
  { href: '/dashboard/coach/clients', label: 'کلاینت‌ها', icon: Users, roles: ['coach'] },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/coaches', label: 'کوچ‌ها', icon: UserCheck },
  { href: '/admin/invite-codes', label: 'کدها', icon: KeyRound },
  { href: '/admin/plans', label: 'پلن‌ها', icon: CreditCard },
];

interface BottomNavProps {
  user: User;
  variant?: 'dashboard' | 'admin';
}

export function BottomNav({ user, variant = 'dashboard' }: BottomNavProps) {
  const pathname = usePathname();
  const allItems = variant === 'admin' ? ADMIN_ITEMS : DASHBOARD_ITEMS;
  const items = allItems.filter(item => !item.roles || item.roles.includes(user.role));

  // Find the most specific (longest) matching item — prevents two items being active at once
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
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
