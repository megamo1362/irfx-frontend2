'use client';

import { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalModal } from './JournalModal';
import type { JournalEntry, MT5Account } from '@/types';

export default function JournalPage() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiFetch<{ accounts: MT5Account[] }>('/accounts/list')
      .then(d => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list.length > 0) setAccountId(String(list[0].id));
      });
  }, []);

  const fetchJournals = () => {
    if (!accountId) return;
    setLoading(true);
    apiFetch<JournalEntry[]>(`/journal/list/${accountId}`)
      .then(setJournals)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJournals(); }, [accountId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiFetch(`/journal/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchJournals();
    } finally {
      setDeleting(false);
    }
  };

  const profitColor = (p?: number) => {
    if (p === undefined || p === null) return 'text-[var(--color-text-muted)]';
    return p >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-status-error)]';
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ژورنال معاملاتی</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">ثبت و پیگیری معاملات</p>
        </div>
        <Button onClick={() => { setEditEntry(null); setModalOpen(true); }} disabled={!accountId}>
          <Plus className="w-4 h-4 ml-1" />
          ثبت ژورنال جدید
        </Button>
      </div>

      {/* Account selector */}
      <div className="mb-5 w-64">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger><SelectValue placeholder="انتخاب حساب" /></SelectTrigger>
          <SelectContent>
            {accounts.map(a => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.label || a.login} — {a.server}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : journals.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)] text-sm">هنوز ژورنالی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journals.map(j => (
            <div key={j.id} className="glass rounded-2xl p-5 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {j.symbol && <span className="font-mono font-bold text-[var(--color-cyan)] text-sm">{j.symbol}</span>}
                    {j.trade_type && (
                      <Badge variant={j.trade_type === 'buy' ? 'green' : 'red'} dot>
                        {j.trade_type === 'buy' ? 'خرید' : 'فروش'}
                      </Badge>
                    )}
                    {j.post_followed_plan !== undefined && j.post_followed_plan !== null && (
                      <Badge variant={j.post_followed_plan ? 'green' : 'red'}>
                        {j.post_followed_plan ? '✓ پایبند' : '✗ پایبند نبود'}
                      </Badge>
                    )}
                    {j.post_rating && (
                      <span className="text-xs text-[var(--color-text-muted)]">امتیاز: {j.post_rating}/10</span>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-[var(--color-text-muted)] flex-wrap">
                    {j.pre_emotion && <span>قبل: <span className="text-[var(--color-text-secondary)]">{j.pre_emotion}</span></span>}
                    {j.post_emotion && <span>بعد: <span className="text-[var(--color-text-secondary)]">{j.post_emotion}</span></span>}
                    {j.tags && <span>تگ: <span className="text-[var(--color-text-secondary)]">{j.tags}</span></span>}
                  </div>
                  {j.pre_reason && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-1">{j.pre_reason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`font-bold text-sm ${profitColor(j.profit)}`}>
                    {j.profit !== undefined && j.profit !== null ? `${j.profit >= 0 ? '+' : ''}$${j.profit}` : '—'}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(j.created_at).toLocaleDateString('fa-IR')}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => { setEditEntry(j); setModalOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(j.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-[var(--color-status-error)]" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journal Modal */}
      <JournalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchJournals}
        accountId={Number(accountId)}
        entry={editEntry}
      />

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass rounded-2xl p-6 border border-[var(--color-border)] max-w-sm w-full mx-4 text-center" dir="rtl">
            <p className="text-[var(--color-text-primary)] font-semibold mb-2">حذف ژورنال</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">آیا مطمئنی؟ این عمل قابل بازگشت نیست.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>انصراف</Button>
              <Button onClick={handleDelete} loading={deleting} className="bg-[var(--color-status-error)] hover:bg-red-600">حذف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
