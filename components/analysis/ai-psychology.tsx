'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle, Clock, Lock, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/app/i18n/LangContext';
import { useAIAnalysis, useAIQuota } from '@/hooks/use-analysis';
import { ApiError } from '@/lib/api';
import type { AIAnalysisResult, AIPattern } from '@/types';

// ── Types ─────────────────────────────────────────────────────
interface Props {
  accountId: string | number;
  fromDate?: string;
  toDate?: string;
}

// ── Severity styles ───────────────────────────────────────────
const SEVERITY_STYLE = {
  high:   { dot: 'bg-red-500',    text: 'text-red-300',    wrap: 'border-red-500/20 bg-red-500/5' },
  medium: { dot: 'bg-orange-500', text: 'text-orange-300', wrap: 'border-orange-500/20 bg-orange-500/5' },
  low:    { dot: 'bg-yellow-400', text: 'text-yellow-200', wrap: 'border-yellow-500/20 bg-yellow-500/5' },
} as const;

const RISK_BADGE = {
  high:   'bg-red-500/15 text-red-300 border-red-500/30',
  medium: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  low:    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
} as const;

const RISK_LABELS: Record<string, { en: string; fa: string }> = {
  high:   { en: 'High Risk',    fa: 'ریسک بالا' },
  medium: { en: 'Medium Risk',  fa: 'ریسک متوسط' },
  low:    { en: 'Low Risk',     fa: 'ریسک پایین' },
};

// ── Pattern card ──────────────────────────────────────────────
function PatternCard({ pattern, lang }: { pattern: AIPattern; lang: 'en' | 'fa' }) {
  const cfg = SEVERITY_STYLE[pattern.severity] ?? SEVERITY_STYLE.low;
  return (
    <div className={`rounded-xl px-4 py-3 border space-y-1 ${cfg.wrap}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`text-sm font-semibold ${cfg.text}`}>{pattern.pattern}</span>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-4">
        {pattern.explanation[lang]}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function AIPsychologyCard({ accountId, fromDate, toDate }: Props) {
  const { lang, t } = useLang();
  const l = (lang === 'fa' ? 'fa' : 'en') as 'en' | 'fa';
  const isRTL = lang === 'fa';

  const { mutate, isPending } = useAIAnalysis();
  const { data: quotaStatus, refetch: refetchQuota } = useAIQuota();

  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<{ code: string; message: string } | null>(null);

  // Most recent quota info: prefer result.quota (post-request) over prefetched status
  const effectiveQuota = result?.quota ?? (quotaStatus
    ? { used: quotaStatus.used, limit: quotaStatus.limit }
    : null);

  const isNoPlan = effectiveQuota?.limit === 0 || quotaBlock?.code === 'plan_no_ai';
  const isExhausted = !isNoPlan && (
    (effectiveQuota?.limit != null && effectiveQuota.used >= effectiveQuota.limit)
    || quotaBlock?.code === 'quota_exceeded'
  );
  const isBlocked = isNoPlan || isExhausted;

  const resetDate = quotaStatus?.reset_date;

  const handleRequest = () => {
    setError(null);
    setQuotaBlock(null);
    mutate(
      { accountId, fromDate, toDate },
      {
        onSuccess: (data) => {
          setResult(data);
          refetchQuota();
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            try {
              const detail = JSON.parse(err.message) as { code?: string; en?: string; fa?: string };
              if (detail.code === 'plan_no_ai' || detail.code === 'quota_exceeded') {
                setQuotaBlock({ code: detail.code, message: detail[l] ?? err.message });
                refetchQuota();
                return;
              }
            } catch { /* plain string error */ }
            setError(err.message);
          } else {
            setError(
              l === 'fa' ? 'خطا در دریافت تحلیل هوش مصنوعی' : 'Failed to fetch AI analysis'
            );
          }
        },
      },
    );
  };

  const riskKey = (result?.risk_level ?? 'low') as 'low' | 'medium' | 'high';

  return (
    <motion.div
      className="card-surface rounded-2xl p-5 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-[var(--color-purple)]/60" />
          <Sparkles className="w-4 h-4 text-[var(--color-purple)]" />
          <h3 className="font-bold text-[var(--color-text-primary)] text-sm">
            {l === 'fa' ? 'تحلیل هوش مصنوعی روانشناسی' : 'AI Psychology Analysis'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${RISK_BADGE[riskKey]}`}>
              {RISK_LABELS[riskKey][l]}
            </span>
          )}
          <Button
            variant={result ? 'ghost' : 'primary'}
            size="sm"
            onClick={handleRequest}
            loading={isPending}
            disabled={isPending || isBlocked}
          >
            {isPending ? null : isBlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 ml-1.5" />
                {l === 'fa' ? 'محدود' : 'Unavailable'}
              </>
            ) : result ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                {l === 'fa' ? 'تجدید' : 'Refresh'}
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                {l === 'fa' ? 'دریافت تحلیل' : 'Get Analysis'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quota remaining — shown below button when limit is finite */}
      {effectiveQuota && effectiveQuota.limit != null && !isBlocked && (
        <p className="text-xs text-[var(--color-text-muted)]">
          {t.ai_quota_remaining(effectiveQuota.used, effectiveQuota.limit)}
        </p>
      )}

      {/* Quota blocked banner */}
      {isBlocked && (
        <div className="rounded-xl px-4 py-3 border border-orange-500/20 bg-orange-500/5 space-y-2">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-300 font-medium leading-snug">
              {isNoPlan
                ? t.ai_quota_no_plan
                : effectiveQuota?.limit != null && resetDate
                  ? t.ai_quota_exhausted(effectiveQuota.used, effectiveQuota.limit, resetDate)
                  : (quotaBlock?.message ?? (l === 'fa' ? 'سهمیه تمام شد' : 'Quota exhausted'))}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-orange-400/70 pl-6">
            <ArrowUpCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t.ai_quota_upgrade_hint}</span>
          </div>
        </div>
      )}

      {/* Generic error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3 border border-red-500/25 bg-red-500/6">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Idle state */}
      {!result && !isPending && !error && !isBlocked && !quotaBlock && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
          {l === 'fa'
            ? 'برای دریافت تحلیل رفتار معاملاتی از هوش مصنوعی، دکمه بالا را بزنید.'
            : 'Click "Get Analysis" to receive an AI-powered behavioral analysis of your trades.'}
        </p>
      )}

      {/* Loading */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 py-6 text-[var(--color-text-muted)]">
          <motion.div
            className="w-5 h-5 border-2 border-[var(--color-purple)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-sm">
            {l === 'fa' ? 'در حال تحلیل...' : 'Analyzing...'}
          </span>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && !isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Cache indicator */}
            {result.cached && result.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>
                  {l === 'fa' ? 'از کش' : 'Cached'} —{' '}
                  {new Date(result.created_at).toLocaleString(l === 'fa' ? 'fa-IR' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-xl px-4 py-3 border border-[var(--color-purple)]/20 bg-[var(--color-purple)]/5">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {result.summary[l]}
              </p>
            </div>

            {/* Key patterns */}
            {result.key_patterns.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {l === 'fa' ? 'الگوهای کلیدی' : 'Key Patterns'}
                </h4>
                <div className="space-y-2">
                  {result.key_patterns.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      <PatternCard pattern={p} lang={l} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {l === 'fa' ? 'توصیه‌ها' : 'Recommendations'}
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {rec[l]}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
