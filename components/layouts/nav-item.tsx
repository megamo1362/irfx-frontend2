'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItem({ href, label, icon: Icon, exact = false, collapsed = false, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]',
        isActive
          ? 'bg-[rgba(139,124,246,0.12)] text-[#8B7CF6]'
          : 'text-[var(--color-text-secondary)]',
      )}
    >
      {/* Active indicator stripe */}
      {isActive && (
        <span className="absolute right-0 inset-y-2 w-0.5 rounded-full bg-[#8B7CF6]" />
      )}

      <Icon
        className={cn(
          'flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-[#8B7CF6]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]',
          collapsed ? 'h-5 w-5' : 'h-4 w-4',
        )}
      />

      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
    </Link>
  );
}
