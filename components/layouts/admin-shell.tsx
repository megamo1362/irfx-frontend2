'use client';

import { AuthGuard, useCurrentUser } from './auth-guard';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { BottomNav } from './bottom-nav';
import { useLang } from '@/app/i18n/LangContext';

interface AdminShellProps {
  children: React.ReactNode;
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const { isRTL } = useLang();

  return (
    <div className="min-h-screen flex bg-[var(--color-void)]">
      {/* Desktop sidebar — direction-aware */}
      <div className={`hidden lg:block fixed top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-[280px] z-20`}>
        <Sidebar user={user} variant="admin" className="h-full" />
      </div>

      <MobileNav user={user} variant="admin" />

      {/* Main content — direction-aware offset */}
      <div className={`flex flex-col flex-1 min-w-0 ${isRTL ? 'lg:mr-[280px]' : 'lg:ml-[280px]'}`}>
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      <BottomNav user={user} variant="admin" />
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <AuthGuard adminOnly>
      <ShellInner>{children}</ShellInner>
    </AuthGuard>
  );
}
