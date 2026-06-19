'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '@/app/i18n/LangContext';
import type { AnalysisWarning } from '@/types';

const LEVEL = {
  danger: {
    Icon: AlertTriangle,
    wrap: 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)]',
    icon: 'text-red-400',
    text: 'text-red-300',
  },
  warning: {
    Icon: AlertCircle,
    wrap: 'border-[rgba(234,179,8,0.3)] bg-[rgba(234,179,8,0.06)]',
    icon: 'text-yellow-400',
    text: 'text-yellow-200',
  },
  info: {
    Icon: Info,
    wrap: 'border-[rgba(0,212,255,0.2)] bg-[var(--color-cyan-dim)]',
    icon: 'text-[var(--color-cyan)]',
    text: 'text-[var(--color-text-secondary)]',
  },
} as const;

export function WarningCards({ warnings }: { warnings: AnalysisWarning[] }) {
  const { t } = useLang();
  if (!warnings?.length) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => {
        const cfg = LEVEL[w.level as keyof typeof LEVEL] ?? LEVEL.info;
        const { Icon } = cfg;

        // Extract first number from English message for use in FA template
        const num = w.message.match(/[\d.]+/)?.[0] ?? '';
        const warnFn = t.warnings[w.type as keyof typeof t.warnings];
        const text = warnFn ? warnFn(num) : w.message;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${cfg.wrap}`}
          >
            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.icon}`} />
            <p className={`text-sm ${cfg.text}`}>{text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
