'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis } from '@/types';

interface EntryExitQualityProps {
  data: Analysis['entry_exit_quality'];
}

const TITLE = { en: 'Entry & Exit Quality', fa: 'کیفیت ورود و خروج' };

function Gauge({ value, label, color, delay }: { value: number; label: string; color: string; delay: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.1, duration: 0.9, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{clamped.toFixed(0)}</span>
          <span className="text-[9px] text-[var(--color-text-muted)]">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] text-center">{label}</p>
    </motion.div>
  );
}

export function EntryExitQuality({ data }: EntryExitQualityProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  if (!data) return null;

  const entryVal = data.avg_entry_quality ?? 0;
  const exitVal = data.avg_exit_quality ?? 0;

  const entryColor = entryVal >= 70 ? '#34d399' : entryVal >= 50 ? '#60a5fa' : '#f87171';
  const exitColor  = exitVal  >= 70 ? '#34d399' : exitVal  >= 50 ? '#60a5fa' : '#f87171';

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-purple)]/60" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{TITLE[l]}</h3>
        <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">
          {l === 'fa' ? `نمونه: ${data.sample_size}` : `Sample: ${data.sample_size}`}
        </span>
      </div>

      {/* Gauges */}
      <div className="flex justify-around">
        <Gauge
          value={entryVal}
          label={l === 'fa' ? 'کیفیت ورود' : 'Entry Quality'}
          color={entryColor}
          delay={0.1}
        />
        <Gauge
          value={exitVal}
          label={l === 'fa' ? 'کیفیت خروج' : 'Exit Quality'}
          color={exitColor}
          delay={0.25}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3 text-center">
          <p className="text-lg font-black text-amber-400">{data.early_exit_count}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {l === 'fa' ? 'خروج زودهنگام' : 'Early Exits'}
          </p>
        </div>
        <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3 text-center">
          <p className="text-lg font-black text-red-400">{data.late_exit_loss_count}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {l === 'fa' ? 'خروج دیرهنگام با ضرر' : 'Late Exit Losses'}
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] px-4 py-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{data.insight[l]}</p>
      </div>
    </motion.div>
  );
}
