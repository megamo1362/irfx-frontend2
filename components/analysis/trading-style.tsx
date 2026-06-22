'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis } from '@/types';

interface TradingStyleProps {
  data: Analysis['trading_style'];
}

const TITLE = { en: 'Trading Style', fa: 'سبک معاملاتی' };

const STYLE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  scalper:    { color: 'text-purple-400',  bg: 'bg-[rgba(168,85,247,0.08)]',  border: 'border-[rgba(168,85,247,0.3)]'  },
  day_trader: { color: 'text-blue-400',    bg: 'bg-[rgba(96,165,250,0.08)]',   border: 'border-[rgba(96,165,250,0.3)]'   },
  swing:      { color: 'text-teal-400',    bg: 'bg-[rgba(45,212,191,0.08)]',   border: 'border-[rgba(45,212,191,0.3)]'   },
  position:   { color: 'text-orange-400',  bg: 'bg-[rgba(251,146,60,0.08)]',  border: 'border-[rgba(251,146,60,0.3)]'  },
};

function pf(n: number) {
  return n >= 0 ? `+$${n.toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`;
}

function StreakCard({
  title,
  data: d,
  color,
  delay,
}: {
  title: string;
  data: { sample_count: number; winrate: number; avg_profit: number } | null;
  color: string;
  delay: number;
}) {
  if (!d) return null;
  const profitColor = d.avg_profit >= 0 ? 'text-emerald-400' : 'text-red-400';
  return (
    <motion.div
      className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3.5 space-y-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>{title}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--color-text-muted)]">{d.sample_count} trades</span>
        <span className={d.winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}>{d.winrate}% WR</span>
      </div>
      <p className={`text-sm font-black ${profitColor}`}>{pf(d.avg_profit)}</p>
    </motion.div>
  );
}

export function TradingStyle({ data }: TradingStyleProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  if (!data) return null;

  const cfg = STYLE_CONFIG[data.style] ?? STYLE_CONFIG.day_trader;

  const holdLabel = () => {
    const m = data.avg_hold_minutes;
    if (m < 60) return `${m.toFixed(0)} ${l === 'fa' ? 'دقیقه' : 'min'}`;
    if (m < 1440) return `${(m / 60).toFixed(1)} ${l === 'fa' ? 'ساعت' : 'h'}`;
    return `${(m / 1440).toFixed(1)} ${l === 'fa' ? 'روز' : 'd'}`;
  };

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${cfg.color.replace('text-', 'bg-')}/60`} />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{TITLE[l]}</h3>
      </div>

      {/* Style badge + hold time */}
      <div className="flex items-center gap-4">
        <motion.div
          className={`rounded-2xl border px-5 py-3 text-center ${cfg.bg} ${cfg.border}`}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <p className={`text-xl font-black ${cfg.color}`}>{data.style_label[l]}</p>
        </motion.div>
        <div className="space-y-1">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
            {l === 'fa' ? 'میانگین زمان نگهداری' : 'Avg Hold Time'}
          </p>
          <p className={`text-2xl font-black ${cfg.color}`}>{holdLabel()}</p>
        </div>
      </div>

      {/* Post-streak behavior */}
      {(data.post_win_streak_behavior || data.post_loss_streak_behavior) && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            {l === 'fa' ? 'رفتار پس از رگه' : 'Post-Streak Behavior'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StreakCard
              title={l === 'fa' ? 'پس از ۳+ برد' : 'After 3+ Wins'}
              data={data.post_win_streak_behavior}
              color="text-emerald-400"
              delay={0.2}
            />
            <StreakCard
              title={l === 'fa' ? 'پس از ۳+ ضرر' : 'After 3+ Losses'}
              data={data.post_loss_streak_behavior}
              color="text-red-400"
              delay={0.28}
            />
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] px-4 py-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.insight[l]}</p>
      </div>
    </motion.div>
  );
}
