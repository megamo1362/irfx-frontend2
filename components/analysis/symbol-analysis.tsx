'use client';

import { motion } from 'framer-motion';
import type { SymbolAnalysisPoint } from '@/types';
import { useLang } from '@/app/i18n/LangContext';

export function SymbolAnalysis({ data }: { data: SymbolAnalysisPoint[] }) {
  const { t } = useLang();

  if (!data?.length) {
    return <p className="text-sm text-[var(--color-text-muted)] text-center py-8">{t.no_data_available}</p>;
  }

  const maxTrades = Math.max(...data.map(s => s.trades));

  const sorted = [...data].sort((a, b) => b.trades - a.trades);

  return (
    <div className="card-surface rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-purple)]/70" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t.symbol_section_title}</h3>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {sorted.map((s, i) => {
          const barWidth = maxTrades > 0 ? (s.trades / maxTrades) * 100 : 0;
          const isProfit = s.profit >= 0;
          return (
            <motion.div
              key={s.symbol}
              className="px-5 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">{s.symbol}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{s.trades} {t.symbol_trades_unit}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400">{s.wins}W</span>
                  <span className="text-red-400">{s.losses}L</span>
                  <span className={`font-bold ${s.winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.winrate}%
                  </span>
                  <span className={`font-bold tabular-nums w-20 text-right ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{s.profit.toFixed(2)}$
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isProfit ? 'bg-emerald-500/50' : 'bg-red-500/40'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
