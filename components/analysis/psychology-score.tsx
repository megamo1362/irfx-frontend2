'use client';

import { motion } from 'framer-motion';
import { Shield, Activity, Eye, TrendingDown, Target, BarChart2 } from 'lucide-react';
import { useLang } from '@/app/i18n/LangContext';

// ── Types ────────────────────────────────────────────────────
interface PsychologyInsight {
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: { en: string; fa: string };
}

interface PsychologyScoreData {
  overall: number;
  grade: { en: string; fa: string };
  scores: {
    revenge_control: number;
    emotional_stability: number;
    fear_control: number;
    risk_management: number;
    discipline: number;
    consistency: number;
  };
  insights: PsychologyInsight[];
}

interface PsychologyScoreProps {
  data: PsychologyScoreData;
}

// ── Constants ────────────────────────────────────────────────
const SUB_SCORE_LABELS: Record<string, { en: string; fa: string }> = {
  revenge_control:     { en: 'Revenge Control',     fa: 'کنترل انتقام' },
  emotional_stability: { en: 'Emotional Stability',  fa: 'ثبات احساسی' },
  fear_control:        { en: 'Fear Control',          fa: 'کنترل ترس' },
  risk_management:     { en: 'Risk Management',       fa: 'مدیریت ریسک' },
  discipline:          { en: 'Discipline',             fa: 'نظم معاملاتی' },
  consistency:         { en: 'Consistency',            fa: 'ثبات عملکرد' },
};

const SUB_SCORE_ICONS: Record<string, React.ElementType> = {
  revenge_control:     Shield,
  emotional_stability: Activity,
  fear_control:        Eye,
  risk_management:     TrendingDown,
  discipline:          Target,
  consistency:         BarChart2,
};

const SEVERITY_STYLE = {
  high:   {
    dot:  'bg-red-500',
    text: 'text-red-300',
    wrap: 'border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)]',
  },
  medium: {
    dot:  'bg-orange-500',
    text: 'text-orange-300',
    wrap: 'border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.06)]',
  },
  low:    {
    dot:  'bg-yellow-400',
    text: 'text-yellow-200',
    wrap: 'border-[rgba(234,179,8,0.25)] bg-[rgba(234,179,8,0.06)]',
  },
} as const;

// ── Color helpers ─────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 55) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function scoreBarColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 55) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function scoreStroke(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 55) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

// ── Circular Progress ─────────────────────────────────────────
function CircleScore({ overall, grade }: { overall: number; grade: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;
  const stroke = scoreStroke(overall);
  const color = scoreColor(overall);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black leading-none ${color}`}>{overall}</span>
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">/100</span>
        </div>
      </div>
      <span className={`text-sm font-bold ${color}`}>{grade}</span>
    </div>
  );
}

// ── Sub-score Row ─────────────────────────────────────────────
function SubScoreRow({ name, score, label, delay }: {
  name: string;
  score: number;
  label: string;
  delay: number;
}) {
  const Icon = SUB_SCORE_ICONS[name] ?? BarChart2;
  const color = scoreColor(score);
  const bar = scoreBarColor(score);

  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
        </div>
        <span className={`text-xs font-bold tabular-nums ${color}`}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.1, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function PsychologyScore({ data }: PsychologyScoreProps) {
  const { lang } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';

  const scoreEntries = Object.entries(data.scores) as [keyof typeof data.scores, number][];

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-purple)]/60" />
        <h3 className="font-bold text-[var(--color-text-primary)] text-sm">
          {l === 'fa' ? 'امتیاز روان‌شناسی معاملاتی' : 'Trading Psychology Score'}
        </h3>
      </div>

      {/* Score circle + sub-scores */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Circle */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <CircleScore overall={data.overall} grade={data.grade[l]} />
        </div>

        {/* Sub-scores grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 w-full">
          {scoreEntries.map(([key, score], i) => {
            const labels = SUB_SCORE_LABELS[key];
            const label = labels ? labels[l] : key;
            return (
              <SubScoreRow
                key={key}
                name={key}
                score={score}
                label={label}
                delay={0.1 + i * 0.06}
              />
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="h-px bg-[var(--color-border)]" />
          {data.insights.map((insight, i) => {
            const cfg = SEVERITY_STYLE[insight.severity] ?? SEVERITY_STYLE.low;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${cfg.wrap}`}
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <p className={`text-sm leading-relaxed ${cfg.text}`}>
                  {insight.message[l]}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
