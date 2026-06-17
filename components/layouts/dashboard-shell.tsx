'use client';

import { AuthGuard, useCurrentUser } from './auth-guard';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import { BottomNav } from './bottom-nav';
import { PageTransition } from './page-transition';
import { Toaster } from '@/components/shared/toaster';
import { CommandPalette } from '@/components/shared/command-palette';
import { AmbientOrbs } from '@/components/effects';
import { useUiStore } from '@/store/ui';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

interface DashboardShellProps {
  children: React.ReactNode;
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const openCommandPalette = useUiStore((s) => s.openCommandPalette);

  // Cmd+K / Ctrl+K → command palette
  useKeyboardShortcut(['meta', 'k'], openCommandPalette, { ignoreInputs: false });
  useKeyboardShortcut(['ctrl', 'k'], openCommandPalette, { ignoreInputs: false });

  return (
    <div className="min-h-screen flex bg-[var(--color-void)]">
      {/* Ambient background effects */}
      <AmbientOrbs />

      {/* Desktop sidebar — fixed right (RTL start) */}
      <div className="hidden lg:block fixed top-0 right-0 bottom-0 w-[280px] z-20">
        <Sidebar user={user} variant="dashboard" className="h-full" />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileNav user={user} variant="dashboard" />

      {/* Main content — offset from right sidebar on desktop */}
      <div className="flex flex-col flex-1 min-w-0 lg:mr-[280px]">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 overflow-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav user={user} variant="dashboard" />

      {/* Global UI layers */}
      <CommandPalette />
      <Toaster />
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <AuthGuard>
      <ShellInner>{children}</ShellInner>
    </AuthGuard>
  );
}
