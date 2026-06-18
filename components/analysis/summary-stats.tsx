'use client';

import { motion } from 'framer-motion';
import type { AnalysisSummary, Analysis } from '@/types';
import { useLang } from '@/app/i18n/LangContext';

function pf(n: number) { return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`; }
function pc(n: number) { return n >= 0 ? 'text-emerald-400' : 'text-red-400'; }
function winColor(rate: number) { return rate >= 50 ? 'text-emerald-400' : 'text-red-400'; }

function StatCard({ label, value, sub, color = 'text-[var(--color-cyan)]', delay = 0 }: {
  label: string; value: string | number; sub?: string; color?: string; delay?: number;
}) {
  return (
    <motion.div
      className="card-surface rounded-2xl p-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1.5">{label}</p>
      <p className={`text-lg font-black leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{sub}</p>}
    </motion.div>
  );
}

function HeroCard({ label, value, color = 'text-[var(--color-cyan)]', delay = 0 }: {
  label: string; value: string | number; color?: string; delay?: number;
}) {
  return (
    <motion.div
      className="card-surface rounded-2xl p-5 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <p className="text-xs text-[var(--color-text-muted)] mb-2">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </motion.div>
  );
}

interface SummaryStatsProps {
  summary: AnalysisSummary;
  analysis: Analysis;
}

export function SummaryStats({ summary: s, analysis }: SummaryStatsProps) {
  const { t } = useLang();
  const totalProfit = s.total_profit;
  const rrColor = s.risk_reward >= 1 ? 'text-emerald-400' : 'text-red-400';

  function formatMinutes(min: number | null) {
    if (min === null) return '—';
    if (min < 60) return t.stat_minutes(min.toFixed(0));
    return t.stat_hours_f((min / 60).toFixed(1));
  }

  const secondary = [
    { label: t.stat_wins,         value: s.wins,                                          color: 'text-emerald-400' },
    { label: t.stat_losses,       value: s.losses,                                         color: 'text-red-400'    },
    { label: t.stat_avg_win,      value: `$${s.avg_win.toFixed(2)}`,                       color: 'text-emerald-400' },
    { label: t.stat_avg_loss,     value: `$${s.avg_loss.toFixed(2)}`,                      color: 'text-red-400'    },
    { label: 'Balance DD',        value: `$${s.max_drawdown.toFixed(2)}`,                  color: 'text-orange-400' },
    { label: 'Balance DD %',      value: `${s.max_drawdown_pct.toFixed(2)}%`,              color: 'text-orange-400' },
    { label: 'Equity DD',         value: `$${(s.max_drawdown_equity ?? 0).toFixed(2)}`,   color: 'text-red-400'    },
    { label: 'Equity DD %',       value: `${(s.max_drawdown_equity_pct ?? 0).toFixed(2)}%`, color: 'text-red-400'  },
    { label: t.stat_consec_losses, value: s.max_consecutive_losses,                        color: 'text-red-400'    },
    { label: t.stat_consec_wins,  value: s.max_consecutive_wins,                           color: 'text-emerald-400' },
    { label: t.stat_open_pos,     value: analysis.open_positions_count,                    color: 'text-[var(--color-cyan)]' },
    { label: 'Floating P&L',      value: `$${analysis.floating_pnl.toFixed(2)}`,           color: pc(analysis.floating_pnl) },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Hero row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HeroCard label="Win Rate" value={`${s.winrate}%`} color={winColor(s.winrate)} delay={0} />
        <HeroCard label="R:R" value={s.risk_reward.toFixed(2)} color={rrColor} delay={0.05} />
        <HeroCard label={t.stat_total_profit} value={pf(totalProfit)} color={pc(totalProfit)} delay={0.1} />
        <HeroCard label={t.stat_total_trades} value={s.total_trades} color="text-[var(--color-cyan)]" delay={0.15} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {secondary.map((st, i) => (
          <StatCard key={st.label} label={st.label} value={st.value} color={st.color} delay={0.2 + i * 0.03} />
        ))}
      </div>

      {/* Best / Worst */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="card-surface rounded-2xl p-4 border-r-2 border-emerald-500/40"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{t.stat_best_trade}</p>
          <p className="font-bold text-[var(--color-text-primary)]">{s.best_trade.symbol}</p>
          <p className="text-lg font-black text-emerald-400">+${s.best_trade.profit.toFixed(2)}</p>
        </motion.div>

        <motion.div
          className="card-surface rounded-2xl p-4 border-r-2 border-red-500/40"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.52 }}
        >
          <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{t.stat_worst_trade}</p>
          <p className="font-bold text-[var(--color-text-primary)]">{s.worst_trade.symbol}</p>
          <p className="text-lg font-black text-red-400">${s.worst_trade.profit.toFixed(2)}</p>
        </motion.div>

        {s.best_day && (
          <motion.div
            className="card-surface rounded-2xl p-4 border-r-2 border-emerald-500/20"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.54 }}
          >
            <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{t.stat_best_day}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{s.best_day.date}</p>
            <p className="text-lg font-black text-emerald-400">+${s.best_day.profit.toFixed(2)}</p>
          </motion.div>
        )}

        {s.worst_day && (
          <motion.div
            className="card-surface rounded-2xl p-4 border-r-2 border-red-500/20"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.56 }}
          >
            <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{t.stat_worst_day}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{s.worst_day.date}</p>
            <p className="text-lg font-black text-red-400">${s.worst_day.profit.toFixed(2)}</p>
          </motion.div>
        )}
      </div>

      {/* MAE / MFE */}
      {analysis.mae_analysis && (
        <motion.div
          className="card-surface rounded-2xl p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-orange-400/60" />
            <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t.stat_mae_title}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_avg_mae}</p>
              <p className="text-base font-bold text-orange-400">${analysis.mae_analysis.avg_mae.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_avg_mfe}</p>
              <p className="text-base font-bold text-blue-400">${analysis.mae_analysis.avg_mfe.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_risky_trades}</p>
              <p className="text-base font-bold text-red-400">{analysis.mae_analysis.risky_trades_count}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_early_close}</p>
              <p className="text-base font-bold text-yellow-400">{analysis.mae_analysis.early_close_count}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hold time */}
      {analysis.hold_time_analysis && (
        <motion.div
          className="card-surface rounded-2xl p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[var(--color-cyan)]/60" />
            <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t.stat_hold_time}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_avg_win_time}</p>
              <p className="text-base font-bold text-emerald-400">
                {formatMinutes(analysis.hold_time_analysis.avg_win_minutes)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{t.stat_avg_loss_time}</p>
              <p className="text-base font-bold text-red-400">
                {formatMinutes(analysis.hold_time_analysis.avg_loss_minutes)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
