'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineLoader } from '@/components/shared';
import { useMyCoaches, useConnectCoach } from '@/hooks/use-coach';
import type { AccountPermissions } from '@/types';

const PERM_KEYS: Array<{ key: keyof Omit<AccountPermissions, 'account_id'>; label: string }> = [
  { key: 'allow_balance',  label: 'موجودی'   },
  { key: 'allow_trades',   label: 'معاملات'  },
  { key: 'allow_analysis', label: 'آنالیز'   },
  { key: 'allow_journal',  label: 'ژورنال'   },
];

export default function JournalPermissionsPage() {
  const { data: coaches = [], isLoading } = useMyCoaches();
  const { mutate: connectCoach, isPending } = useConnectCoach();

  const [perms, setPerms] = useState<Record<number, Record<number, AccountPermissions>>>({});
  const [saved, setSaved] = useState<number | null>(null);

  useEffect(() => {
    if (!coaches.length) return;
    setPerms((prev) => {
      const map = { ...prev };
      for (const c of coaches) {
        if (!map[c.coach_id]) {
          map[c.coach_id] = {};
          for (const p of c.account_permissions ?? []) map[c.coach_id][p.account_id] = p;
        }
      }
      return map;
    });
  }, [coaches]);

  const toggle = (coachId: number, accountId: number, key: keyof Omit<AccountPermissions, 'account_id'>) => {
    setPerms((prev) => {
      const coachPerms = { ...(prev[coachId] ?? {}) };
      const cur = coachPerms[accountId] ?? { account_id: accountId, allow_balance: true, allow_trades: true, allow_analysis: true, allow_journal: false };
      coachPerms[accountId] = { ...cur, [key]: !cur[key] };
      return { ...prev, [coachId]: coachPerms };
    });
  };

  const save = (coachId: number) => {
    const coach = coaches.find((c) => c.coach_id === coachId);
    if (!coach) return;
    const accountPerms = Object.values(perms[coachId] ?? {});
    connectCoach(
      {
        coach_email: coach.coach_email,
        display_mode: coach.display_mode,
        display_label: coach.display_label ?? undefined,
        account_ids: coach.shared_account_ids,
        account_permissions: accountPerms.length > 0 ? accountPerms : coach.account_permissions,
      },
      {
        onSuccess: () => {
          setSaved(coachId);
          setTimeout(() => setSaved(null), 2000);
        },
      },
    );
  };

  if (isLoading) return <InlineLoader />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">دسترسی کوچ‌ها</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          مشخص کنید هر کوچ از کدام حساب چه اطلاعاتی را می‌تواند ببیند.
        </p>
      </div>

      {coaches.length === 0 ? (
        <div className="card-surface rounded-2xl p-12 text-center">
          <ShieldCheck className="h-10 w-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)]">هیچ کوچی متصل نیست.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => {
            const coachPerms = perms[coach.coach_id] ?? {};
            return (
              <div key={coach.coach_id} className="card-surface rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)]">{coach.coach_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{coach.coach_email}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isPending}
                    onClick={() => save(coach.coach_id)}
                  >
                    {saved === coach.coach_id ? '✓ ذخیره شد' : 'ذخیره'}
                  </Button>
                </div>

                {coach.shared_account_ids.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-[var(--color-text-muted)]">حسابی اشتراک‌گذاری نشده.</div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]">
                    {coach.account_permissions.map((ap) => {
                      const cur = coachPerms[ap.account_id] ?? ap;
                      return (
                        <div key={ap.account_id} className="px-5 py-3">
                          <p className="text-xs font-mono font-bold text-[var(--color-text-secondary)] mb-2">
                            حساب #{ap.account_id}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {PERM_KEYS.map(({ key, label }) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => toggle(coach.coach_id, ap.account_id, key)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                                style={{
                                  background: cur[key] ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                                  borderColor: cur[key] ? 'rgba(0,212,255,0.35)' : 'var(--color-border)',
                                  color: cur[key] ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                                }}
                              >
                                <span>{cur[key] ? '✓' : '✗'}</span>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
