'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AUTH_TOKEN_KEY, ROUTES } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/app/i18n/LangContext';
import type { User } from '@/types';

interface UserMenuProps {
  user: User;
  compact?: boolean;
}

export function UserMenu({ user, compact = false }: UserMenuProps) {
  const router = useRouter();
  const { t } = useLang();

  const roleLabels: Record<string, string> = {
    admin: t.role_admin,
    coach: t.role_coach,
    client: t.role_client,
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    router.push(ROUTES.login);
  };

  const displayName = user.full_name || user.email;
  const initials = getInitials(displayName);

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-status-error)] transition-all duration-200 w-full"
        title={t.user_logout}
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span>{t.user_logout}</span>
      </button>
    );
  }

  return (
    <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
      <div className="flex items-center gap-3 px-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-blue)] flex items-center justify-center text-sm font-bold text-[var(--color-void)]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{displayName}</p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
        </div>
        <Badge variant={user.role === 'admin' ? 'red' : user.role === 'coach' ? 'cyan' : 'blue'} className="flex-shrink-0">
          {roleLabels[user.role]}
        </Badge>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--color-status-error)] transition-all duration-200 w-full"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        <span>{t.user_logout}</span>
      </button>
    </div>
  );
}
