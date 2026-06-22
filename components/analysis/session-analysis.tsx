'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis } from '@/types';

interface SessionAnalysisProps {
  data: Analysis['session_analysis'];
}

const TITLE = { en: 'Market Session Analysis', fa: 'آنالیز سشن‌های بازار' };

function pf(n: number) {
  return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

export function SessionAnalysis({ data }: SessionAnalysisProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  if (!data?.sessions?.length) return null;

  const bestKey  = data.best_session?.session;
  const worstKey = data.worst_session?.session;

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-teal)]/60" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{TITLE[l]}</h3>
      </div>

      {/* Session cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.sessions.map((s, i) => {
          const isBest  = s.session === bestKey;
          const isWorst = s.session === worstKey;
          const profitColor = s.profit >= 0 ? 'text-emerald-400' : 'text-red-400';

          let cardCls = 'rounded-xl p-3.5 border space-y-2 relative overflow-hidden';
          if (isBest)  cardCls += ' border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.05)]';
          else if (isWorst) cardCls += ' border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.05)]';
          else cardCls += ' border-[var(--color-border)] bg-[rgba(255,255,255,0.02)]';

          return (
            <motion.div
              key={s.session}
              className={cardCls}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.28 }}
            >
              {isBest  && <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-400 bg-[rgba(34,197,94,0.15)] px-1.5 py-0.5 rounded-full">{l === 'fa' ? 'بهترین' : 'Best'}</span>}
              {isWorst && <span className="absolute top-2 right-2 text-[9px] font-bold text-red-400 bg-[rgba(239,68,68,0.15)] px-1.5 py-0.5 rounded-full">{l === 'fa' ? 'بدترین' : 'Worst'}</span>}

              <p className="text-xs font-semibold text-[var(--color-text-primary)] pr-10">{s.label[l]}</p>
              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>{s.trades} {l === 'fa' ? 'معامله' : 'trades'}</span>
                <span className={s.winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}>{s.winrate}%</span>
              </div>
              <p className={`text-sm font-black ${profitColor}`}>{pf(s.profit)}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
