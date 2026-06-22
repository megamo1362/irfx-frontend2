'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis } from '@/types';

interface ParetoAnalysisProps {
  data: Analysis['pareto_analysis'];
}

const TITLE = { en: 'Pareto Analysis (80/20)', fa: 'آنالیز پارتو ۸۰/۲۰' };

function pf(n: number) {
  return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

function SymbolBar({
  symbol,
  sharePct,
  amount,
  color,
  delay,
}: {
  symbol: string;
  sharePct: number;
  amount: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.25 }}
    >
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-mono font-semibold text-[var(--color-text-secondary)]">{symbol}</span>
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)]">{sharePct}%</span>
          <span className={`font-bold ${color}`}>{pf(amount)}</span>
        </div>
      </div>
      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(sharePct, 100)}%` }}
          transition={{ delay: delay + 0.1, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export function ParetoAnalysis({ data }: ParetoAnalysisProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  if (!data) return null;

  const { profit_pareto: pp, loss_pareto: lp } = data;

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-blue)]/60" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{TITLE[l]}</h3>
      </div>

      {/* Profit / Loss panels */}
      <div className="grid grid-cols-2 gap-3">
        {/* Profit panel */}
        <div className="rounded-xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.04)] p-4 space-y-2">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            {l === 'fa' ? 'سود (پارتو)' : 'Profit (Pareto)'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <span className="text-emerald-400 font-bold">{pp.top_trades_count}</span>
            {' '}{l === 'fa' ? 'معامله' : 'trades'}{' '}
            ({pp.top_trades_pct_of_total}%){' '}
            {l === 'fa' ? '= ۸۰٪ کل سود' : '= 80% of profit'}
          </p>
          <p className="text-base font-black text-emerald-400">{pf(pp.top_trades_profit)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {l === 'fa' ? 'کل سود:' : 'Total:'} {pf(pp.total_profit)}
          </p>
        </div>

        {/* Loss panel */}
        <div className="rounded-xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.04)] p-4 space-y-2">
          <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
            {l === 'fa' ? 'ضرر (پارتو)' : 'Loss (Pareto)'}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <span className="text-red-400 font-bold">{lp.top_trades_count}</span>
            {' '}{l === 'fa' ? 'معامله' : 'trades'}{' '}
            ({lp.top_trades_pct_of_total}%){' '}
            {l === 'fa' ? '= ۸۰٪ کل ضرر' : '= 80% of loss'}
          </p>
          <p className="text-base font-black text-red-400">{pf(lp.top_trades_loss)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {l === 'fa' ? 'کل ضرر:' : 'Total:'} {pf(lp.total_loss)}
          </p>
        </div>
      </div>

      {/* Symbol breakdowns */}
      {(data.symbol_profit_share.length > 0 || data.symbol_loss_share.length > 0) && (
        <div className="grid grid-cols-2 gap-5">
          {/* Profit symbols */}
          {data.symbol_profit_share.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {l === 'fa' ? 'نمادهای سودده' : 'Profit by Symbol'}
              </p>
              {data.symbol_profit_share.slice(0, 5).map((s, i) => (
                <SymbolBar
                  key={s.symbol}
                  symbol={s.symbol}
                  sharePct={s.share_pct}
                  amount={s.profit}
                  color="text-emerald-400"
                  delay={0.15 + i * 0.05}
                />
              ))}
            </div>
          )}
          {/* Loss symbols */}
          {data.symbol_loss_share.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {l === 'fa' ? 'نمادهای زیانده' : 'Loss by Symbol'}
              </p>
              {data.symbol_loss_share.slice(0, 5).map((s, i) => (
                <SymbolBar
                  key={s.symbol}
                  symbol={s.symbol}
                  sharePct={s.share_pct}
                  amount={s.loss}
                  color="text-red-400"
                  delay={0.15 + i * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
