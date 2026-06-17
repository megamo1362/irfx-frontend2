'use client';

import { AuthGuard, useCurrentUser } from './auth-guard';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { BottomNav } from './bottom-nav';

interface AdminShellProps {
  children: React.ReactNode;
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen flex bg-[var(--color-void)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed top-0 right-0 bottom-0 w-[280px] z-20">
        <Sidebar user={user} variant="admin" className="h-full" />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileNav user={user} variant="admin" />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:mr-[280px]">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
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
