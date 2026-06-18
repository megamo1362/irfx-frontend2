'use client';

import { motion } from 'framer-motion';
import type { TimeAnalysisPoint } from '@/types';
import { useLang } from '@/app/i18n/LangContext';

function HourBar({ point, maxTrades, delay }: { point: TimeAnalysisPoint; maxTrades: number; delay: number }) {
  const barWidth = maxTrades > 0 ? (point.trades / maxTrades) * 100 : 0;
  const isProfit = point.profit >= 0;
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span className="text-xs font-mono text-[var(--color-text-muted)] w-10 flex-shrink-0 text-left">
        {String(point.hour).padStart(2, '0')}:00
      </span>
      <div className="flex-1 h-6 bg-[rgba(255,255,255,0.03)] rounded-md overflow-hidden relative">
        <div
          className={`h-full rounded-md transition-all ${isProfit ? 'bg-emerald-500/30' : 'bg-red-500/25'}`}
          style={{ width: `${barWidth}%` }}
        />
        <div className="absolute inset-0 flex items-center px-2 gap-2">
          <span className="text-[10px] text-[var(--color-text-muted)]">{point.trades}</span>
          <span className="text-[10px] text-emerald-400">{point.wins}W</span>
          <span className="text-[10px] text-red-400">{point.losses}L</span>
        </div>
      </div>
      <span className={`text-xs font-bold w-12 text-left ${point.winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
        {point.winrate}%
      </span>
      <span className={`text-xs font-bold w-20 text-left tabular-nums ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}{point.profit.toFixed(2)}$
      </span>
    </motion.div>
  );
}

export function TimeAnalysis({ data }: { data: TimeAnalysisPoint[] }) {
  const { t } = useLang();

  if (!data?.length) {
    return <p className="text-sm text-[var(--color-text-muted)] text-center py-8">{t.no_data_available}</p>;
  }

  const maxTrades = Math.max(...data.map(p => p.trades));

  return (
    <div className="space-y-4">
      <div className="card-surface rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 rounded-full bg-[var(--color-cyan)]/60" />
          <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{t.time_section_title}</h3>
        </div>
        <div className="space-y-2">
          {data.map((p, i) => (
            <HourBar key={p.hour} point={p} maxTrades={maxTrades} delay={i * 0.025} />
          ))}
        </div>
      </div>
    </div>
  );
}
