'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalAnalysisView } from '../JournalAnalysisView';
import { useLang } from '@/app/i18n/LangContext';
import type { MT5Account, JournalAnalysisData } from '@/types';

export default function JournalAnalysisPage() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [data, setData] = useState<JournalAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    apiFetch<{ accounts: MT5Account[] }>('/accounts/list')
      .then(d => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list.length > 0) setAccountId(String(list[0].id));
      });
  }, []);

  const load = async () => {
    if (!accountId) return;
    setLoading(true);
    setError('');
    setForbidden(false);
    try {
      const result = await apiFetch<JournalAnalysisData>(`/journal/analysis/${accountId}`);
      setData(result);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setForbidden(true);
      } else {
        setError(e instanceof Error ? e.message : t.analysis_error_load);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.journal_analysis_title}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.journal_analysis_desc}</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger className="w-64"><SelectValue placeholder={t.journal_select_account} /></SelectTrigger>
          <SelectContent>
            {accounts.map(a => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.label || a.login} — {a.server}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={load} loading={loading} disabled={!accountId}>{t.journal_analysis_load_btn}</Button>
      </div>

      {forbidden && (
        <div className="glass rounded-2xl p-8 border border-[var(--color-border)] text-center">
          <p className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{t.journal_analysis_no_access}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{t.journal_analysis_upgrade}</p>
        </div>
      )}

      {error && <p className="text-sm text-[var(--color-status-error)] mb-4">{error}</p>}

      <JournalAnalysisView data={data} loading={loading} />
    </div>
  );
}
