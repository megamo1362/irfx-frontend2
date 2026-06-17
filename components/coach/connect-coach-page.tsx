'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineLoader } from '@/components/shared';
import { DisplaySettings } from './display-settings';
import {
  useMyCoaches,
  useConnectCoach,
  useDisconnectCoach,
  type MyCoach,
  type ConnectCoachInput,
} from '@/hooks/use-coach';
import { useAccounts } from '@/hooks/use-accounts';
import { getInitials } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import type { DisplayMode } from '@/types';

// ── Edit panel (for existing connection) ───────────────────

function EditPanel({
  coach,
  onClose,
}: {
  coach: MyCoach;
  onClose: () => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const [mode, setMode] = useState<DisplayMode>(coach.display_mode);
  const [label, setLabel] = useState(coach.display_label ?? '');
  const [selectedIds, setSelectedIds] = useState<number[]>(coach.shared_account_ids);
  const { mutate: connect, isPending: saving, error } = useConnectCoach();

  const apiError = error instanceof ApiError ? error.message : null;
  const needsLabel = mode === 'name' || mode === 'both';
  const canSave = selectedIds.length > 0 && (!needsLabel || label.trim().length > 0);

  const toggleId = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = () => {
    const payload: ConnectCoachInput = {
      coach_email: coach.coach_email,
      display_mode: mode,
      account_ids: selectedIds,
    };
    if (needsLabel && label.trim()) payload.display_label = label.trim();
    connect(payload, { onSuccess: onClose });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden border-t border-[var(--color-border)]"
    >
      <div className="px-5 py-4 space-y-4">
        <DisplaySettings
          mode={mode}
          label={label}
          onModeChange={setMode}
          onLabelChange={setLabel}
        />

        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">حساب‌های مشترک</p>
          <div className="space-y-2">
            {accounts.map((acc) => (
              <label
                key={acc.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer border transition-all"
                style={{
                  background: selectedIds.includes(acc.id) ? 'var(--color-cyan-dim)' : 'var(--color-elevated)',
                  borderColor: selectedIds.includes(acc.id) ? 'rgba(0,212,255,0.25)' : 'var(--color-border)',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(acc.id)}
                  onChange={() => toggleId(acc.id)}
                  className="accent-cyan-400"
                />
                <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">{acc.login}</span>
              </label>
            ))}
          </div>
        </div>

        {apiError && (
          <p className="text-sm text-[var(--color-status-error)]">{apiError}</p>
        )}

        <div className="flex gap-2">
          <Button variant="primary" size="sm" className="flex-1" onClick={handleSave} loading={saving} disabled={!canSave || saving}>
            ذخیره تغییرات
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClose}>انصراف</Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── My coaches list ────────────────────────────────────────

function MyCoachesList() {
  const { data: coaches = [], isLoading } = useMyCoaches();
  const { mutate: disconnect, isPending: disconnecting, variables: disconnectingId } = useDisconnectCoach();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) return <InlineLoader />;

  if (coaches.length === 0) {
    return (
      <div className="card-surface rounded-2xl p-8 text-center">
        <Link2 className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
        <p className="text-sm text-[var(--color-text-muted)]">هنوز به هیچ کوچی متصل نشدید</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {coaches.map((c) => (
        <div key={c.coach_id} className="card-surface rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-cyan)] flex items-center justify-center text-xs font-bold text-[var(--color-void)] flex-shrink-0">
                {getInitials(c.coach_name)}
              </div>
              <div>
                <p className="font-bold text-[var(--color-text-primary)]">{c.coach_name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{c.coach_email}</p>
                {c.connected_since && (
                  <p className="text-xs text-[var(--color-text-muted)]/60 mt-0.5">
                    از {new Date(c.connected_since).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingId(editingId === c.coach_id ? null : c.coach_id)}
              >
                {editingId === c.coach_id ? 'بستن' : 'ویرایش'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnect(c.coach_id)}
                loading={disconnecting && disconnectingId === c.coach_id}
                className="text-[var(--color-status-error)] hover:bg-[rgba(239,68,68,0.08)]"
              >
                قطع
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {editingId === c.coach_id && (
              <EditPanel coach={c} onClose={() => setEditingId(null)} />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────

export function ConnectCoachPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text-primary)]">کوچ‌های من</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          کوچ‌های متصل به حسابتان
        </p>
      </div>
      <MyCoachesList />
    </div>
  );
}
