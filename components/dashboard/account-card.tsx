'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, Trash2, Clock, Server, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useDeleteAccount, useSyncAccount } from '@/hooks/use-accounts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useLang } from '@/app/i18n/LangContext';
import type { MT5Account } from '@/types';

interface AccountCardProps {
  account: MT5Account;
  index?: number;
}

export function AccountCard({ account, index = 0 }: AccountCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: sync, isPending: syncing } = useSyncAccount();
  const { mutate: deleteAccount, isPending: deleting } = useDeleteAccount();
  const { t } = useLang();

  const handleSync = () => sync(account.id);
  const handleDelete = () => {
    deleteAccount(account.id, { onSuccess: () => setDeleteOpen(false) });
  };

  return (
    <>
      <motion.div
        className="card-interactive rounded-2xl p-5 group"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-cyan-dim)] to-[var(--color-blue-dim)] border border-[var(--color-cyan)]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-[var(--color-cyan)]">MT5</span>
            </div>

            <div>
              <p className="text-base font-bold text-[var(--color-text-primary)] font-mono tracking-wider">
                {account.login}
              </p>
              {account.label && (
                <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                  <Tag className="h-3 w-3" />
                  {account.label}
                </p>
              )}
            </div>
          </div>

          <Badge variant={account.is_active ? 'cyan' : 'gray'} dot>
            {account.is_active ? t.account_active : t.account_inactive}
          </Badge>
        </div>

        {/* Server */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-4">
          <Server className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-mono">{account.server}</span>
        </div>

        {/* Balance */}
        <div className="rounded-xl bg-[var(--color-void)]/60 border border-[var(--color-border)] px-4 py-3 mb-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">{t.account_balance}</p>
          <p className="text-xl font-black tabular-nums text-[var(--color-cyan)]">
            {account.balance !== null ? formatCurrency(account.balance) : '—'}
          </p>
        </div>

        {/* Last sync */}
        {account.last_sync_at && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-4">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{t.account_last_sync} {formatDate(account.last_sync_at)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
          <Button variant="primary" size="sm" className="flex-1" asChild>
            <Link href={ROUTES.analyze(account.id)}>
              <TrendingUp className="h-3.5 w-3.5 ml-1.5" />
              {t.account_analyze}
            </Link>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSync}
            loading={syncing}
            disabled={syncing}
            title={t.account_sync}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-status-error)] hover:bg-[rgba(239,68,68,0.08)]"
            title={t.account_delete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.account_delete_title}</DialogTitle>
            <DialogDescription>
              {t.account_delete_desc(account.login)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">{t.cancel}</Button>
            </DialogClose>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              {t.account_delete_confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
