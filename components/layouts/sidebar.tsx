'use client';

'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart2, Users, UserPlus, LayoutDashboard, UserCheck, KeyRound, CreditCard } from 'lucide-react';
import { NavItem } from './nav-item';
import { UserMenu } from './user-menu';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

// ── Nav configs ───────────────────────────────────────────────────────

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  roles?: Array<User['role']>;
}

const DASHBOARD_NAV: NavEntry[] = [
  { href: '/dashboard', label: 'حساب‌ها', icon: BarChart2, exact: true },
  { href: '/dashboard/coach/clients', label: 'کلاینت‌های من', icon: Users, roles: ['coach'] },
  { href: '/dashboard/connect-coach', label: 'اتصال به کوچ', icon: UserPlus, roles: ['client'] },
];

const ADMIN_NAV: NavEntry[] = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/coaches', label: 'کوچ‌ها', icon: UserCheck },
  { href: '/admin/invite-codes', label: 'کدهای دعوت', icon: KeyRound },
  { href: '/admin/plans', label: 'پلن‌ها', icon: CreditCard },
];

// ── Sidebar ───────────────────────────────────────────────────────────

interface SidebarProps {
  user: User;
  variant?: 'dashboard' | 'admin';
  onNavClick?: () => void;
  className?: string;
}

export function Sidebar({ user, variant = 'dashboard', onNavClick, className }: SidebarProps) {
  const navItems = variant === 'admin' ? ADMIN_NAV : DASHBOARD_NAV;
  const visibleItems = navItems.filter((item) =>
    !item.roles || item.roles.includes(user.role),
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-[280px] bg-[var(--color-deep)] border-l border-[var(--color-border)]',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[var(--color-border)]">
        <Link href={variant === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Zenvora" className="h-10 w-auto object-contain" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            exact={item.exact}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 px-3 pb-4">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
