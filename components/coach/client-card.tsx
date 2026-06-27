'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useLang } from '@/app/i18n/LangContext';
import type { CoachClient } from '@/types';


function getDisplayName(client: CoachClient): string {
  const fallback = client.client_full_name || client.client_email;
  if (client.display_mode === 'email') return client.client_email;
  if (client.display_mode === 'both') {
    const name = client.display_label || fallback;
    return `${name} (${client.client_email})`;
  }
  return client.display_label || fallback;
}

const PLAN_VARIANT: Record<string, 'purple' | 'cyan' | 'blue' | 'yellow'> = {
  elite: 'purple',
  pro: 'cyan',
  basic: 'blue',
  trial: 'yellow',
};

interface ClientCardProps {
  client: CoachClient;
  index?: number;
}

export function ClientCard({ client, index = 0 }: ClientCardProps) {
  const [open, setOpen] = useState(true);
  const { t } = useLang();
  const name = getDisplayName(client);

  return (
    <motion.div
      className="card-surface rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-blue)] to-[var(--color-purple)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[var(--color-text-primary)] truncate">{name}</p>
            {client.connected_since && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {t.client_connected_since(new Date(client.connected_since).toLocaleDateString('fa-IR'))}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {client.plan_name && client.plan_slug && (
            <Badge variant={PLAN_VARIANT[client.plan_slug] ?? 'blue'}>
              {client.plan_name}
            </Badge>
          )}
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(!open)}>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Accounts */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {client.accounts.length === 0 ? (
              <div className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                {t.client_no_accounts}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {client.accounts.map((acc) => (
                  <div key={acc.id} className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={acc.is_demo ? 'yellow' : 'red'}>
                        {acc.is_demo ? 'Demo' : 'Real'}
                      </Badge>
                      <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
                        {acc.login}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Permission badges */}
                      <div className="hidden sm:flex items-center gap-1">
                        {[
                          { key: 'allow_balance', label: 'موجودی' },
                          { key: 'allow_trades', label: 'معاملات' },
                          { key: 'allow_analysis', label: 'آنالیز' },
                          { key: 'allow_journal', label: 'ژورنال' },
                        ].map(({ key, label }) => {
                          const allowed = acc[key as keyof typeof acc] as boolean;
                          return (
                            <span
                              key={key}
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{
                                background: allowed ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                                color: allowed ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                                opacity: allowed ? 1 : 0.5,
                              }}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>

                      {acc.has_snapshot && (
                        <>
                          <div className="text-center hidden sm:block">
                            <p className="text-[10px] text-[var(--color-text-muted)]">{t.client_balance}</p>
                            <p className="text-sm font-bold text-[var(--color-cyan)] tracking-widest">
                              {acc.allow_balance && acc.balance !== null ? `$${acc.balance.toFixed(2)}` : '●●●●●'}
                            </p>
                          </div>
                          <div className="text-center hidden sm:block">
                            <p className="text-[10px] text-[var(--color-text-muted)]">{t.client_equity}</p>
                            <p className="text-sm font-bold text-[var(--color-text-primary)] tracking-widest">
                              {acc.allow_balance && acc.equity !== null ? `$${acc.equity.toFixed(2)}` : '●●●●●'}
                            </p>
                          </div>
                          <div className="text-center hidden md:block">
                            <p className="text-[10px] text-[var(--color-text-muted)]">{t.client_drawdown}</p>
                            <p className="text-sm font-bold text-[#f97316]">
                              {acc.max_drawdown !== null ? `${acc.max_drawdown.toFixed(1)}%` : '—'}
                            </p>
                          </div>
                        </>
                      )}

                      <Button variant="secondary" size="sm" asChild>
                        <Link href={ROUTES.analyze(acc.id)}>
                          <BarChart2 className="h-3.5 w-3.5 ml-1" />
                          {t.client_analyze}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
