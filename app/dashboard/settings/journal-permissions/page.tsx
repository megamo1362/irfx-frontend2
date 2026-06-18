'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { useLang } from '@/app/i18n/LangContext';
import type { JournalPermission } from '@/types';

export default function JournalPermissionsPage() {
  const [permissions, setPermissions] = useState<JournalPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const { t } = useLang();

  useEffect(() => {
    apiFetch<{ permissions: JournalPermission[] }>('/journal/permission/my-settings')
      .then(d => setPermissions(d.permissions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (coachId: number, allow: boolean) => {
    setSaving(coachId);
    try {
      await apiFetch(`/journal/permission/coach/${coachId}`, {
        method: 'PUT',
        body: { allow },
      });
      setPermissions(prev => prev.map(p => p.coach_id === coachId ? { ...p, allow_journal_view: allow } : p));
      setToast(t.journal_perms_saved);
      setTimeout(() => setToast(''), 2500);
    } catch (e) {
      setToast(e instanceof Error ? e.message : t.error_generic);
      setTimeout(() => setToast(''), 2500);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.journal_perms_title}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.journal_perms_desc}</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : permissions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)]">{t.journal_perms_no_coaches}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {permissions.map(p => (
            <div key={p.coach_id} className="glass rounded-2xl px-5 py-4 border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{p.coach_name}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {p.allow_journal_view ? t.journal_perms_can_view : t.journal_perms_no_access}
                </p>
              </div>
              <Switch
                checked={p.allow_journal_view}
                disabled={saving === p.coach_id}
                onCheckedChange={v => toggle(p.coach_id, v)}
              />
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-5 py-3 border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
