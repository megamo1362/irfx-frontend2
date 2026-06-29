'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, XSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';
import { useSaveJournal } from '@/hooks/use-analysis';
import { useLang } from '@/app/i18n/LangContext';
import type { Trade, Journal, JournalEntry, OpenPosition } from '@/types';

// ── Journal modal ──────────────────────────────────────────

const PRE_EMOTION_KEYS = ['confident', 'fearful', 'greedy', 'calm', 'revenge', 'FOMO'] as const;
const POST_EMOTION_KEYS = ['satisfied', 'regret', 'neutral', 'frustrated', 'happy'] as const;
const TAGS = ['FOMO', 'Revenge', 'GoodSetup', 'Overtrading', 'EarlyExit', 'LateEntry'];

function JournalModal({
  trade,
  accountId,
  onClose,
}: {
  trade: Trade;
  accountId: string;
  onClose: () => void;
}) {
  const { t } = useLang();

  const emotionLabel = (key: string) => {
    const map: Record<string, string> = {
      confident: t.emotion_confident, fearful: t.emotion_fearful,
      greedy: t.emotion_greedy, calm: t.emotion_calm,
      revenge: t.emotion_revenge, satisfied: t.emotion_satisfied,
      regret: t.emotion_regret, neutral: t.emotion_neutral,
      frustrated: t.emotion_frustrated, happy: t.emotion_happy,
    };
    return map[key] ?? key;
  };
  const [j, setJ] = useState<Journal>({});
  const [journalId, setJournalId] = useState<number | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const { mutate: save, isPending, isSuccess } = useSaveJournal();

  useEffect(() => {
    setLoadingExisting(true);
    setJournalId(null);
    setJ({});
    apiFetch<JournalEntry | null>(`/journal/by-ticket/${accountId}/${trade.ticket}`)
      .then(existing => {
        if (existing?.id) {
          setJournalId(existing.id);
          setJ({
            pre_emotion: existing.pre_emotion,
            pre_reason: existing.pre_reason,
            post_emotion: existing.post_emotion,
            post_lesson: existing.post_lesson,
            post_rating: existing.post_rating,
            post_followed_plan: existing.post_followed_plan,
            tags: existing.tags,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trade.ticket]);

  const handleSave = () => {
    save({
      account_id: Number(accountId),
      ticket: trade.ticket,
      symbol: trade.symbol,
      trade_type: trade.type === 0 ? 'buy' : 'sell',
      profit: trade.profit,
      ...j,
      ...(journalId ? { journal_id: journalId } : {}),
    }, { onSuccess: () => setTimeout(onClose, 1200) });
  };

  const toggleTag = (tag: string) => {
    const current = j.tags ? j.tags.split(',').filter(Boolean) : [];
    const next = current.includes(tag) ? current.filter(tg => tg !== tag) : [...current, tag];
    setJ(prev => ({ ...prev, tags: next.join(',') }));
  };

  const activeTags = j.tags ? j.tags.split(',').filter(Boolean) : [];
  const isProfit = trade.profit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--color-text-primary)]">
            {loadingExisting ? t.loading : journalId ? t.journal_modal_edit : t.journal_modal_create}
          </h3>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Trade summary */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] mb-5 flex-wrap text-sm">
          <span className="font-mono font-bold text-[var(--color-text-primary)]">{trade.symbol}</span>
          <Badge variant={trade.type === 0 ? 'green' : 'red'}>{trade.type === 0 ? 'BUY' : 'SELL'}</Badge>
          <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{trade.profit.toFixed(2)}$
          </span>
          <span className="text-[var(--color-text-muted)] text-xs">{trade.time.slice(0, 16).replace('T', ' ')}</span>
        </div>

        <div className="space-y-5">
          {/* Pre emotion */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_pre_label}</p>
            <div className="flex flex-wrap gap-2">
              {PRE_EMOTION_KEYS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setJ(prev => ({ ...prev, pre_emotion: e }))}
                  className={`px-3 py-1.5 rounded-lg text-xs text-center transition-all ${
                    j.pre_emotion === e
                      ? 'bg-[var(--color-cyan-dim)] border border-[rgba(0,212,255,0.3)] text-[var(--color-cyan)] font-bold'
                      : 'bg-[rgba(255,255,255,0.04)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  <div>{emotionLabel(e)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pre reason */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_entry_reason_label}</p>
            <textarea
              value={j.pre_reason ?? ''}
              onChange={e => setJ(prev => ({ ...prev, pre_reason: e.target.value }))}
              rows={3}
              placeholder={t.journal_reason_placeholder}
              className="input-dark w-full rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Post emotion */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_post_label}</p>
            <div className="flex flex-wrap gap-2">
              {POST_EMOTION_KEYS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setJ(prev => ({ ...prev, post_emotion: e }))}
                  className={`px-3 py-1.5 rounded-lg text-xs text-center transition-all ${
                    j.post_emotion === e
                      ? 'bg-[var(--color-cyan-dim)] border border-[rgba(0,212,255,0.3)] text-[var(--color-cyan)] font-bold'
                      : 'bg-[rgba(255,255,255,0.04)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  <div>{emotionLabel(e)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Post lesson */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_lesson_label}</p>
            <textarea
              value={j.post_lesson ?? ''}
              onChange={e => setJ(prev => ({ ...prev, post_lesson: e.target.value }))}
              rows={2}
              placeholder={t.journal_lesson_placeholder}
              className="input-dark w-full rounded-xl px-3 py-2.5 text-sm resize-none"
            />
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_rating_label}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setJ(prev => ({ ...prev, post_rating: r }))}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    j.post_rating === r
                      ? 'bg-[var(--color-cyan)] text-[var(--color-void)]'
                      : 'bg-[rgba(255,255,255,0.04)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Followed plan */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_followed_plan_q}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJ(prev => ({ ...prev, post_followed_plan: true }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  j.post_followed_plan === true
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5" /> {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setJ(prev => ({ ...prev, post_followed_plan: false }))}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  j.post_followed_plan === false
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                <XSquare className="h-3.5 w-3.5" /> {t.no}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-2">{t.journal_tags_label}</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all border ${
                    activeTags.includes(tag)
                      ? 'bg-[rgba(234,179,8,0.15)] border-[rgba(234,179,8,0.3)] text-yellow-400 font-bold'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Success */}
          {isSuccess && (
            <div className="rounded-xl px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
              {t.journal_saved}
            </div>
          )}

          <Button variant="primary" size="md" className="w-full" onClick={handleSave} loading={isPending} disabled={isPending}>
            {t.journal_save_btn}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Trades table ───────────────────────────────────────────

type Filter = 'all' | 'win' | 'loss';

interface TradesTableProps {
  trades: Trade[];
  openPositions?: OpenPosition[];
  accountId: string;
  showJournal?: boolean;
}

const PAGE_SIZE = 50;

export function TradesTable({ trades, openPositions = [], accountId, showJournal = true }: TradesTableProps) {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [journalTrade, setJournalTrade] = useState<Trade | null>(null);

  const realTrades = trades.filter(tr => [0, 1].includes(tr.type) && tr.volume > 0 && tr.profit !== 0);

  const filtered = filter === 'all'
    ? realTrades
    : filter === 'win'
    ? realTrades.filter(tr => tr.profit > 0)
    : realTrades.filter(tr => tr.profit < 0);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const wins = realTrades.filter(tr => tr.profit > 0).length;
  const losses = realTrades.filter(tr => tr.profit < 0).length;

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {([
          { key: 'all',  label: `${t.trades_filter_all} (${realTrades.length})` },
          { key: 'win',  label: `${t.stat_wins} (${wins})`   },
          { key: 'loss', label: `${t.stat_losses} (${losses})` },
        ] as { key: Filter; label: string }[]).map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => { setFilter(f.key); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filter === f.key
                ? 'bg-[var(--color-cyan-dim)] border-[rgba(0,212,255,0.25)] text-[var(--color-cyan)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-surface rounded-2xl overflow-hidden">
        {openPositions.length === 0 && filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] text-sm p-10">{t.trades_no_results}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm irfx-table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-right">{t.trades_col_symbol}</th>
                  <th className="px-4 py-3 text-center">{t.trades_col_type}</th>
                  <th className="px-4 py-3 text-center">{t.trades_col_volume}</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">{t.trades_col_entry}</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">{t.trades_col_exit}</th>
                  <th className="px-4 py-3 text-center">{t.trades_col_pnl}</th>
                  <th className="px-4 py-3 text-center text-rose-400 hidden lg:table-cell">{t.trades_col_sl}</th>
                  <th className="px-4 py-3 text-center text-emerald-400 hidden lg:table-cell">{t.trades_col_tp}</th>
                  <th className="px-4 py-3 text-center text-purple-400 hidden lg:table-cell">{t.trades_col_spread} <span className="opacity-40 text-[10px]">(pip/$)</span></th>
                  <th className="px-4 py-3 text-center text-orange-400 hidden md:table-cell">MAE$</th>
                  <th className="px-4 py-3 text-center text-blue-400 hidden md:table-cell">MFE$</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">{t.trades_col_time}</th>
                  {showJournal && <th className="px-4 py-3 text-center w-12" />}
                </tr>
              </thead>
              <tbody>
                {/* Open positions */}
                {openPositions.map((pos, i) => {
                  const isProfit = pos.profit >= 0;
                  const hasSl = pos.sl != null && pos.sl > 0;
                  const hasTp = pos.tp != null && pos.tp > 0;
                  return (
                    <motion.tr
                      key={`open-${pos.ticket}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="border-t border-[var(--color-border)] bg-[rgba(0,212,255,0.02)] hover:bg-[rgba(0,212,255,0.04)] transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono font-bold text-[var(--color-text-primary)]">
                        {pos.symbol}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.type === 'buy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {pos.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-muted)] tabular-nums">
                        {pos.volume}
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-muted)] tabular-nums text-xs hidden sm:table-cell">
                        {pos.open_price}
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-cyan)] tabular-nums text-xs font-mono hidden sm:table-cell">
                        {pos.current_price}
                      </td>
                      <td className="px-4 py-2.5 text-center tabular-nums">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.2)]">
                            باز
                          </span>
                          <span className={`text-[10px] font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isProfit ? '+' : ''}{pos.profit.toFixed(2)}$
                          </span>
                        </div>
                      </td>
                      {/* SL */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {hasSl ? (
                          <span className="text-rose-400 font-mono">{pos.sl}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] opacity-40">{t.trades_sl_none}</span>
                        )}
                      </td>
                      {/* TP */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {hasTp ? (
                          <span className="text-emerald-400 font-mono">{pos.tp}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] opacity-40">{t.trades_sl_none}</span>
                        )}
                      </td>
                      {/* Spread at open only */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {pos.spread_pips_open != null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-[10px] font-mono text-purple-300">
                              <span title="Spread at open">{pos.spread_pips_open}p</span>
                            </div>
                            {pos.spread_cost != null && pos.spread_cost > 0 && (
                              <div className="text-[10px] text-purple-500">${pos.spread_cost.toFixed(2)}</div>
                            )}
                          </div>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center text-orange-400 text-xs tabular-nums hidden md:table-cell">
                        {pos.mae != null ? `$${pos.mae.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center text-blue-400 text-xs tabular-nums hidden md:table-cell">
                        {pos.mfe != null ? `$${pos.mfe.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-left text-[var(--color-text-muted)] text-xs tabular-nums hidden sm:table-cell">
                        {pos.open_time.replace('T', ' ').slice(0, 16)}
                      </td>
                      {showJournal && <td className="px-3 py-2.5" />}
                    </motion.tr>
                  );
                })}
                {/* Closed trades */}
                {paginated.map((trade, i) => {
                  const isProfit = trade.profit >= 0;
                  const hasSl = trade.sl && trade.sl > 0;
                  const hasTp = trade.tp && trade.tp > 0;
                  const slModCount = trade.sl_history ? trade.sl_history.length - 1 : 0;
                  const tpModCount = trade.tp_history ? trade.tp_history.length - 1 : 0;
                  return (
                    <motion.tr
                      key={trade.ticket}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="border-t border-[var(--color-border)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono font-bold text-[var(--color-text-primary)]">
                        {trade.symbol}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.type === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {trade.type === 0 ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-muted)] tabular-nums">
                        {trade.volume}
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-muted)] tabular-nums text-xs hidden sm:table-cell">
                        {trade.open_price ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center text-[var(--color-text-muted)] tabular-nums text-xs hidden sm:table-cell">
                        {trade.price}
                      </td>
                      <td className={`px-4 py-2.5 text-center font-bold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{trade.profit.toFixed(2)}$
                      </td>
                      {/* SL */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {hasSl ? (
                          <span
                            className="inline-flex flex-col items-center gap-0.5"
                            title={trade.sl_history && trade.sl_history.length > 1
                              ? trade.sl_history.join(' → ')
                              : undefined}
                          >
                            <span className="text-rose-400 font-mono">{trade.sl}</span>
                            {slModCount > 0 && (
                              <span className="text-[9px] text-yellow-400 opacity-80">
                                {t.trades_sl_modified(slModCount)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] opacity-40">{t.trades_sl_none}</span>
                        )}
                      </td>
                      {/* TP */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {hasTp ? (
                          <span
                            className="inline-flex flex-col items-center gap-0.5"
                            title={trade.tp_history && trade.tp_history.length > 1
                              ? trade.tp_history.join(' → ')
                              : undefined}
                          >
                            <span className="text-emerald-400 font-mono">{trade.tp}</span>
                            {tpModCount > 0 && (
                              <span className="text-[9px] text-yellow-400 opacity-80">
                                {t.trades_sl_modified(tpModCount)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] opacity-40">{t.trades_sl_none}</span>
                        )}
                      </td>
                      {/* Spread */}
                      <td className="px-3 py-2.5 text-center text-xs tabular-nums hidden lg:table-cell">
                        {trade.spread_pips_open != null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-[10px] font-mono leading-tight text-purple-300">
                              <span title="Spread at open">{trade.spread_pips_open}p</span>
                              <span className="opacity-30 mx-0.5">+</span>
                              <span title="Spread at close">{trade.spread_pips_close}p</span>
                              <span className="opacity-30 mx-0.5">=</span>
                              <span className="font-bold text-purple-400" title="Total spread charged">{trade.spread_pips_total}p</span>
                            </div>
                            {trade.spread_cost != null && trade.spread_cost > 0 && (
                              <div className="text-[10px] text-purple-500">${trade.spread_cost.toFixed(2)}</div>
                            )}
                          </div>
                        ) : trade.spread_cost != null && trade.spread_cost > 0 ? (
                          <div className="text-[10px] text-purple-400">${trade.spread_cost.toFixed(2)}</div>
                        ) : (
                          <span className="opacity-30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center text-orange-400 text-xs tabular-nums hidden md:table-cell">
                        {trade.mae != null ? `$${trade.mae.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center text-blue-400 text-xs tabular-nums hidden md:table-cell">
                        {trade.mfe != null ? `$${trade.mfe.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-left text-[var(--color-text-muted)] text-xs tabular-nums hidden sm:table-cell">
                        {trade.time.replace('T', ' ').slice(0, 16)}
                      </td>
                      {showJournal && (
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setJournalTrade(trade)}
                            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-cyan)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--color-cyan-dim)] border border-transparent hover:border-[rgba(0,212,255,0.2)]"
                          >
                            {t.trades_journal_btn}
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30 hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {t.trades_prev}
          </button>
          <span className="text-xs text-[var(--color-text-muted)]">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30 hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {t.trades_next}
          </button>
        </div>
      )}

      {/* Journal modal */}
      <AnimatePresence>
        {journalTrade && (
          <JournalModal
            trade={journalTrade}
            accountId={accountId}
            onClose={() => setJournalTrade(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
