'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Pencil } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalModal } from './JournalModal';
import { useLang } from '@/app/i18n/LangContext';
import type { JournalEntry, MT5Account, Trade } from '@/types';

export default function JournalPage() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const { t } = useLang();

  useEffect(() => {
    apiFetch<{ accounts: MT5Account[] }>('/accounts/list')
      .then(d => {
        const list = d.accounts ?? [];
        setAccounts(list);
        if (list.length > 0) setAccountId(String(list[0].id));
      });
  }, []);

  const fetchData = () => {
    if (!accountId) return;
    setLoading(true);
    Promise.all([
      apiFetch<{ trades: Trade[] }>(`/trades/list/${accountId}`),
      apiFetch<JournalEntry[]>(`/journal/list/${accountId}`),
    ])
      .then(([tradesResp, journalsResp]) => {
        setTrades(tradesResp.trades ?? []);
        setJournals(journalsResp ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [accountId]);

  const journalMap = new Map<number, JournalEntry>();
  journals.forEach(j => { if (j.ticket != null) journalMap.set(j.ticket, j); });

  const openModal = (trade: Trade) => {
    const existing = journalMap.get(trade.ticket) ?? null;
    setSelectedTrade(trade);
    setSelectedEntry(existing);
    setModalOpen(true);
  };

  const profitColor = (p: number) =>
    p >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-status-error)]';

  const realTrades = trades.filter(t => [0, 1].includes(t.type) && t.volume > 0 && t.profit !== 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.journal_title}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.journal_desc}</p>
        </div>
      </div>

      <div className="mb-5 w-64">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger><SelectValue placeholder={t.journal_select_account} /></SelectTrigger>
          <SelectContent>
            {accounts.map(a => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.label || a.login} — {a.server}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : realTrades.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)] text-sm">{t.journal_no_trades}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {realTrades.map(trade => {
            const hasJournal = journalMap.has(trade.ticket);
            return (
              <div
                key={trade.ticket}
                className="glass rounded-2xl px-5 py-3 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors flex items-center gap-4"
              >
                <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold text-[var(--color-cyan)] text-sm">{trade.symbol}</span>
                  <Badge variant={trade.type === 0 ? 'green' : 'red'}>
                    {trade.type === 0 ? t.journal_buy : t.journal_sell}
                  </Badge>
                  <span className={`font-bold text-sm tabular-nums ${profitColor(trade.profit)}`}>
                    {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}$
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums hidden sm:inline">
                    {trade.time?.slice(0, 10)}
                  </span>
                  {hasJournal && (
                    <Badge variant="cyan">
                      <BookOpen className="w-3 h-3 ml-0.5" />
                      {t.journal_logged}
                    </Badge>
                  )}
                </div>
                <Button
                  variant={hasJournal ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => openModal(trade)}
                  className="flex-shrink-0"
                >
                  {hasJournal ? (
                    <><Pencil className="w-3.5 h-3.5 ml-1" />{t.journal_edit}</>
                  ) : (
                    <><BookOpen className="w-3.5 h-3.5 ml-1" />{t.journal_log}</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <JournalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchData}
        accountId={Number(accountId)}
        entry={selectedEntry}
        trade={selectedTrade ? {
          ticket: selectedTrade.ticket,
          symbol: selectedTrade.symbol,
          type: selectedTrade.type,
          profit: selectedTrade.profit,
        } : null}
      />
    </div>
  );
}
