'use client';

import { useEffect, useState, useMemo } from 'react';
import { BookOpen, Pencil, CalendarRange } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JournalModal } from './JournalModal';
import { useLang } from '@/app/i18n/LangContext';
import type { JournalEntry, MT5Account, Trade } from '@/types';

type DatePreset = 'this_week' | 'this_month' | 'last_month' | '3_months' | '6_months' | '1_year' | 'custom' | 'all';

const PRESET_LABELS: Record<DatePreset, { en: string; fa: string }> = {
  all:        { en: 'All Time',       fa: 'همه' },
  this_week:  { en: 'This Week',      fa: 'هفته جاری' },
  this_month: { en: 'This Month',     fa: 'ماه جاری' },
  last_month: { en: 'Last Month',     fa: 'ماه گذشته' },
  '3_months': { en: 'Last 3 Months',  fa: '۳ ماه گذشته' },
  '6_months': { en: 'Last 6 Months',  fa: '۶ ماه گذشته' },
  '1_year':   { en: 'Last Year',      fa: 'یک سال گذشته' },
  custom:     { en: 'Custom Range',   fa: 'بازه دلخواه' },
};

function getPresetRange(preset: DatePreset): { from: Date; to: Date } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'all' || preset === 'custom') return null;

  if (preset === 'this_week') {
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return { from: monday, to: now };
  }
  if (preset === 'this_month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  }
  if (preset === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { from, to };
  }
  if (preset === '3_months') {
    const from = new Date(now); from.setMonth(from.getMonth() - 3);
    return { from, to: now };
  }
  if (preset === '6_months') {
    const from = new Date(now); from.setMonth(from.getMonth() - 6);
    return { from, to: now };
  }
  if (preset === '1_year') {
    const from = new Date(now); from.setFullYear(from.getFullYear() - 1);
    return { from, to: now };
  }
  return null;
}

export default function JournalPage() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { t, lang } = useLang();
  const l = lang === 'fa' ? 'fa' : 'en';

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

  const realTrades = useMemo(() => {
    const base = trades.filter(t => [0, 1].includes(t.type) && t.volume > 0 && t.profit !== 0);

    let from: Date | null = null;
    let to: Date | null = null;

    if (datePreset === 'custom') {
      if (customFrom) from = new Date(customFrom);
      if (customTo)   to   = new Date(customTo + 'T23:59:59');
    } else {
      const range = getPresetRange(datePreset);
      if (range) { from = range.from; to = range.to; }
    }

    if (!from && !to) return base;
    return base.filter(trade => {
      const d = new Date(trade.time);
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });
  }, [trades, datePreset, customFrom, customTo]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.journal_title}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.journal_desc}</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <div className="w-56">
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

        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {(Object.keys(PRESET_LABELS) as DatePreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => setDatePreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  datePreset === preset
                    ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.3)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                {PRESET_LABELS[preset][l]}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
            />
            <span className="text-xs text-[var(--color-text-muted)]">—</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="px-2.5 py-1 rounded-lg text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : realTrades.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)] text-sm">
            {datePreset !== 'all'
              ? (l === 'fa' ? 'معامله‌ای در این بازه زمانی یافت نشد' : 'No trades found in this date range')
              : t.journal_no_trades}
          </p>
          {datePreset !== 'all' && (
            <button onClick={() => setDatePreset('all')} className="mt-3 text-xs text-[var(--color-cyan)] hover:underline">
              {l === 'fa' ? 'نمایش همه' : 'Show all trades'}
            </button>
          )}
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
