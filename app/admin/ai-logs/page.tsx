'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/app/i18n/LangContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

// ── Types ──────────────────────────────────────────────
interface AILog {
  id: number;
  user_id: number;
  user_email: string;
  account_id: number;
  status: 'success' | 'cached' | 'error';
  tokens_used: number | null;
  latency_ms: number | null;
  created_at: string | null;
  error_message: string | null;
}

interface AIStats {
  total_requests: number;
  total_tokens_all: number;
  total_tokens_30d: number;
  cache_hit_rate: number;
  error_rate: number;
  top_users: Array<{
    user_id: number;
    email: string;
    tokens_used: number;
    request_count: number;
  }>;
}

// ── Helpers ────────────────────────────────────────────
const STATUS_BADGE: Record<string, 'green' | 'blue' | 'red'> = {
  success: 'green',
  cached: 'blue',
  error: 'red',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl border border-[var(--color-border)] p-5 space-y-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────
export default function AdminAILogsPage() {
  const { t } = useLang();

  const [stats, setStats] = useState<AIStats | null>(null);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 50;

  const [errorRow, setErrorRow] = useState<AILog | null>(null);

  const FILTERS = [
    { value: '', label: t.admin_ai_logs_filter_all },
    { value: 'success', label: t.admin_ai_logs_filter_success },
    { value: 'cached', label: t.admin_ai_logs_filter_cached },
    { value: 'error', label: t.admin_ai_logs_filter_error },
  ];

  const fetchLogs = useCallback((status: string, offset: number) => {
    setLoading(true);
    const params = new URLSearchParams({ skip: String(offset), limit: String(limit) });
    if (status) params.set('status', status);
    apiFetch<{ total: number; logs: AILog[] }>(`/admin/ai-logs?${params}`)
      .then(d => { setLogs(d.logs); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => {
    apiFetch<AIStats>('/admin/ai-stats').then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setSkip(0);
    fetchLogs(statusFilter, 0);
  }, [statusFilter, fetchLogs]);

  const statusLabel: Record<string, string> = {
    success: t.admin_ai_logs_status_success,
    cached: t.admin_ai_logs_status_cached,
    error: t.admin_ai_logs_status_error,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.admin_ai_logs_title}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.admin_ai_logs_total(total)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t.admin_ai_logs_stat_total} value={stats?.total_requests ?? '—'} />
        <StatCard
          label={t.admin_ai_logs_stat_tokens_30d}
          value={stats ? stats.total_tokens_30d.toLocaleString() : '—'}
        />
        <StatCard
          label={t.admin_ai_logs_stat_cache_rate}
          value={stats ? `${stats.cache_hit_rate}%` : '—'}
        />
        <StatCard
          label={t.admin_ai_logs_stat_error_rate}
          value={stats ? `${stats.error_rate}%` : '—'}
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-[var(--color-deep)] border border-[var(--color-border)] rounded-xl p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === f.value
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-[#020510] font-bold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Logs table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass rounded-2xl border border-[var(--color-border)] px-6 py-12 text-center">
          <p className="text-[var(--color-text-muted)] text-sm">{t.admin_ai_logs_no_data}</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-deep)] text-[var(--color-text-muted)]">
                <th className="px-4 py-3 text-left">{t.admin_ai_logs_col_user}</th>
                <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_account}</th>
                <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_status}</th>
                <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_tokens}</th>
                <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_latency}</th>
                <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_date}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => log.status === 'error' && log.error_message ? setErrorRow(log) : undefined}
                  className={`border-t border-[var(--color-border)] transition-colors ${
                    log.status === 'error' && log.error_message
                      ? 'cursor-pointer hover:bg-red-500/5'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)] text-xs truncate max-w-[200px]">
                      {log.user_email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)] text-xs">
                    #{log.account_id}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE[log.status] ?? 'blue'} dot>
                      {statusLabel[log.status] ?? log.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)] text-xs tabular-nums">
                    {log.tokens_used != null && log.tokens_used > 0
                      ? log.tokens_used.toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)] text-xs tabular-nums">
                    {log.latency_ms != null && log.latency_ms > 0
                      ? `${log.latency_ms}ms`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)] text-xs">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            {skip + 1}–{Math.min(skip + limit, total)} / {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={skip === 0}
              onClick={() => { const next = Math.max(0, skip - limit); setSkip(next); fetchLogs(statusFilter, next); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30 hover:text-[var(--color-text-primary)] transition-colors"
            >
              ‹ Prev
            </button>
            <button
              disabled={skip + limit >= total}
              onClick={() => { const next = skip + limit; setSkip(next); fetchLogs(statusFilter, next); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30 hover:text-[var(--color-text-primary)] transition-colors"
            >
              Next ›
            </button>
          </div>
        </div>
      )}

      {/* Top users section */}
      {stats && stats.top_users.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{t.admin_ai_logs_top_users}</h2>
          <div className="glass rounded-2xl overflow-hidden border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-deep)] text-[var(--color-text-muted)]">
                  <th className="px-4 py-3 text-left">{t.admin_ai_logs_col_user}</th>
                  <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_tokens}</th>
                  <th className="px-4 py-3 text-center">{t.admin_ai_logs_col_requests}</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_users.map((u, i) => (
                  <tr key={u.user_id} className="border-t border-[var(--color-border)] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] w-4">{i + 1}</span>
                        <span className="text-xs font-medium text-[var(--color-text-primary)] truncate max-w-[220px]">
                          {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-[var(--color-cyan)] tabular-nums">
                      {u.tokens_used.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)] tabular-nums">
                      {u.request_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error detail dialog */}
      <Dialog open={!!errorRow} onOpenChange={open => { if (!open) setErrorRow(null); }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{t.admin_ai_logs_error_detail}</DialogTitle>
          </DialogHeader>
          {errorRow && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-text-muted)]">{errorRow.user_email}</p>
              <pre className="rounded-xl bg-red-500/8 border border-red-500/20 text-red-300 text-xs p-4 whitespace-pre-wrap break-all font-mono leading-relaxed">
                {errorRow.error_message}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
