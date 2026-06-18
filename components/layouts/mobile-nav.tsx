'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/store/ui';
import { useLang } from '@/app/i18n/LangContext';
import type { User } from '@/types';

interface MobileNavProps {
  user: User;
  variant?: 'dashboard' | 'admin';
}

export function MobileNav({ user, variant = 'dashboard' }: MobileNavProps) {
  const { mobileSidebarOpen, closeMobileSidebar } = useUiStore();
  const { isRTL } = useLang();

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileSidebar();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const slidePos = isRTL ? 'right-0' : 'left-0';
  const slideInitial = isRTL ? '100%' : '-100%';
  const closeButtonPos = isRTL ? 'left-4' : 'right-4';

  return (
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileSidebar}
          />

          <motion.div
            key="panel"
            className={`fixed top-0 ${slidePos} bottom-0 z-50 lg:hidden`}
            initial={{ x: slideInitial }}
            animate={{ x: 0 }}
            exit={{ x: slideInitial }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="relative h-full">
              <button
                onClick={closeMobileSidebar}
                className={`absolute top-4 ${closeButtonPos} z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors`}
              >
                <X className="h-4 w-4" />
              </button>

              <Sidebar
                user={user}
                variant={variant}
                onNavClick={closeMobileSidebar}
                className="h-full shadow-2xl"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
