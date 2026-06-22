'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis } from '@/types';

interface CostAnalysisProps {
  data: Analysis['cost_analysis'];
}

const TITLE = { en: 'Cost Analysis', fa: 'آنالیز هزینه‌ها' };

function pf(n: number) {
  return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

function StatBox({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-4 text-center"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
    >
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{label}</p>
    </motion.div>
  );
}

export function CostAnalysis({ data }: CostAnalysisProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  if (!data) return null;

  const impactColor =
    data.cost_impact_pct > 20 ? 'text-red-400' :
    data.cost_impact_pct > 10 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-orange)]/60" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{TITLE[l]}</h3>
      </div>

      {/* 3 stat boxes */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          label={l === 'fa' ? 'کمیسیون' : 'Commission'}
          value={`$${Math.abs(data.total_commission).toFixed(2)}`}
          color="text-amber-400"
          delay={0.05}
        />
        <StatBox
          label={l === 'fa' ? 'سوآپ' : 'Swap'}
          value={`$${Math.abs(data.total_swap).toFixed(2)}`}
          color="text-amber-400"
          delay={0.10}
        />
        <StatBox
          label={l === 'fa' ? 'کل هزینه' : 'Total Costs'}
          value={`$${Math.abs(data.total_costs).toFixed(2)}`}
          color="text-red-400"
          delay={0.15}
        />
      </div>

      {/* Cost impact bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[var(--color-text-muted)]">
            {l === 'fa' ? 'تأثیر هزینه بر سود ناخالص' : 'Cost Impact on Gross Profit'}
          </span>
          <span className={`font-bold ${impactColor}`}>{data.cost_impact_pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${impactColor.replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(data.cost_impact_pct, 100)}%` }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
          <span>{l === 'fa' ? 'سود ناخالص:' : 'Gross profit:'} {pf(data.gross_profit)}</span>
          {data.most_expensive_symbol && (
            <span>
              {l === 'fa' ? 'گران‌ترین:' : 'Most costly:'}{' '}
              <span className="font-mono text-amber-400">{data.most_expensive_symbol.symbol}</span>
            </span>
          )}
        </div>
      </div>

      {/* Symbol cost list */}
      {data.symbol_costs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {l === 'fa' ? 'هزینه به تفکیک نماد' : 'Cost by Symbol'}
          </p>
          {data.symbol_costs.slice(0, 6).map((s, i) => {
            const maxCost = data.symbol_costs[0]?.total_cost ?? 1;
            const pct = maxCost ? (Math.abs(s.total_cost) / Math.abs(maxCost)) * 100 : 0;
            return (
              <motion.div
                key={s.symbol}
                className="space-y-1"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04, duration: 0.22 }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-[var(--color-text-secondary)]">{s.symbol}</span>
                  <span className="text-amber-400 font-bold">${Math.abs(s.total_cost).toFixed(2)}</span>
                </div>
                <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-amber-400/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
