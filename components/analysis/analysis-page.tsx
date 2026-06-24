'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Clock, Zap, ArrowRight, Printer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InlineLoader } from '@/components/shared';
import { WarningCards } from './warning-cards';
import { PsychologyScore } from './psychology-score';
import { SessionAnalysis } from './session-analysis';
import { ParetoAnalysis } from './pareto-analysis';
import { EntryExitQuality } from './entry-exit-quality';
import { CostAnalysis } from './cost-analysis';
import { TradingStyle } from './trading-style';
import { SummaryStats } from './summary-stats';
import { ChartTabs } from './chart-tabs';
import { TradesTable } from './trades-table';
import { TimeAnalysis } from './time-analysis';
import { SymbolAnalysis } from './symbol-analysis';
import { useCheckAndRun, useRealtimeAnalysis, useUserFeatures } from '@/hooks/use-analysis';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis, Trade } from '@/types';

interface PageData {
  balance: number | null;
  equity: number | null;
  analysis: Analysis;
  trades: Trade[];
  snapshotTime: string | null;
  hoursUntilNext: number | null;
  hoursSinceUpdate: number | null;
}

type TabKey = 'summary' | 'trades' | 'time' | 'symbols' | 'equity';

export function AnalysisPage({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const isCoachMode = searchParams?.get('coach') === 'true';
  const { t, lang } = useLang();

  const { mutate: checkAndRun, isPending: initialLoading } = useCheckAndRun();
  const { mutate: runRealtime, isPending: realtimeLoading } = useRealtimeAnalysis();
  const { data: features } = useUserFeatures();

  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

  const hasTriggered = useRef(false);

  const formatHours = (h: number): string => {
    if (h < 0.1) return t.time_just_now;
    if (h < 1) return `${Math.round(h * 60)} ${t.time_min}`;
    return `${h.toFixed(1)} ${t.time_hours}`;
  };

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    checkAndRun(id, {
      onSuccess: (snap) => {
        if (snap.has_snapshot && snap.analysis) {
          setData({
            balance: snap.balance ?? null,
            equity: snap.equity ?? null,
            analysis: snap.analysis,
            trades: snap.trades ?? [],
            snapshotTime: snap.snapshot_time ?? null,
            hoursUntilNext: snap.hours_until_next ?? null,
            hoursSinceUpdate: snap.hours_since_update ?? null,
          });
        }
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : t.analysis_error_load);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRealtime = () => {
    setError(null);
    runRealtime(id, {
      onSuccess: (result) => {
        setData({
          balance: result.balance ?? null,
          equity: result.equity ?? null,
          analysis: result.analysis,
          trades: result.trades ?? [],
          snapshotTime: null,
          hoursUntilNext: null,
          hoursSinceUpdate: null,
        });
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : t.analysis_error_run);
      },
    });
  };

  const canRunRealtime = !isCoachMode && (features?.realtime_analysis ?? false);
  const realTrades = (data?.trades ?? []).filter(t => [0, 1].includes(t.type) && t.volume > 0 && t.profit !== 0);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'summary', label: t.analysis_tab_summary },
    { key: 'trades', label: `${t.analysis_tab_trades} (${realTrades.length})` },
    { key: 'time', label: t.analysis_tab_time },
    { key: 'symbols', label: t.analysis_tab_symbols },
    { key: 'equity', label: t.analysis_tab_charts },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={ROUTES.dashboard} className="print:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
              <ArrowRight className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-black text-[var(--color-text-primary)]">{t.analysis_account_title}</h1>
            <span className="text-sm text-[var(--color-text-muted)] font-mono">#{id}</span>
          </div>

          {data?.snapshotTime && data.hoursSinceUpdate !== null && (
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t.analysis_update_ago(formatHours(data.hoursSinceUpdate))}
              </span>
              {data.hoursUntilNext !== null && (
                <span>{t.analysis_next_in(formatHours(data.hoursUntilNext))}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {canRunRealtime && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRealtime}
              loading={realtimeLoading}
              disabled={realtimeLoading}
            >
              <Zap className="h-3.5 w-3.5 ml-1.5" />
              {t.analysis_realtime_btn}
            </Button>
          )}
          {data && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5 ml-1.5" />
              {lang === 'fa' ? 'خروجی PDF' : 'Export PDF'}
            </Button>
          )}
        </div>
      </div>

      {/* Account balance row */}
      {data && (data.balance !== null || data.equity !== null) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card-surface rounded-2xl p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{t.analysis_balance}</p>
            <p className="text-xl font-black text-[var(--color-cyan)]">
              ${data.balance?.toFixed(2) ?? '—'}
            </p>
          </div>
          <div className="card-surface rounded-2xl p-4 text-center">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">{t.analysis_equity}</p>
            <p className="text-xl font-black text-emerald-400">
              ${data.equity?.toFixed(2) ?? '—'}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {initialLoading && !data && <InlineLoader label={t.analysis_loading} />}

      {/* No snapshot */}
      {!initialLoading && !data && !error && (
        <div className="card-surface rounded-2xl p-14 text-center">
          <BarChart2 className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-lg">{t.analysis_no_snapshot}</p>
          {canRunRealtime && (
            <p className="text-sm text-[var(--color-text-muted)]/60 mt-1">
              {t.analysis_realtime_hint}
            </p>
          )}
        </div>
      )}

      {/* Has data */}
      {data && (
        <>
          {/* Warnings */}
          {data.analysis.warnings?.length > 0 && (
            <WarningCards warnings={data.analysis.warnings} />
          )}

          {/* Psychology Score */}
          {data.analysis.psychology_score && (
            <PsychologyScore data={data.analysis.psychology_score} />
          )}

          {/* Session Analysis */}
          {data.analysis.session_analysis && (
            <SessionAnalysis data={data.analysis.session_analysis} />
          )}

          {/* Pareto Analysis */}
          {data.analysis.pareto_analysis && (
            <ParetoAnalysis data={data.analysis.pareto_analysis} />
          )}

          {/* Entry & Exit Quality */}
          {data.analysis.entry_exit_quality && (
            <EntryExitQuality data={data.analysis.entry_exit_quality} />
          )}

          {/* Cost Analysis */}
          {data.analysis.cost_analysis && (
            <CostAnalysis data={data.analysis.cost_analysis} />
          )}

          {/* Trading Style */}
          {data.analysis.trading_style && (
            <TradingStyle data={data.analysis.trading_style} />
          )}

          {/* No analysis data */}
          {!data.analysis.has_data && (
            <div className="card-surface rounded-2xl p-10 text-center">
              <p className="text-[var(--color-text-muted)]">{data.analysis.message ?? t.analysis_no_data}</p>
            </div>
          )}

          {data.analysis.has_data && (
            <>
              {/* Tabs */}
              <div className="print:hidden flex overflow-x-auto gap-0.5 p-1 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[var(--color-border)] w-fit max-w-full no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.2)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="print:hidden"
                >
                  {activeTab === 'summary' && data.analysis.summary && (
                    <SummaryStats summary={data.analysis.summary} analysis={data.analysis} />
                  )}

                  {activeTab === 'trades' && (
                    <TradesTable
                      trades={data.trades}
                      accountId={id}
                      showJournal={!isCoachMode}
                    />
                  )}

                  {activeTab === 'time' && (
                    <TimeAnalysis data={data.analysis.time_analysis ?? []} />
                  )}

                  {activeTab === 'symbols' && (
                    <SymbolAnalysis data={data.analysis.symbol_analysis ?? []} />
                  )}

                  {activeTab === 'equity' && (
                    <ChartTabs accountId={id} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Print-only: always render summary */}
              <div className="hidden print:block">
                {data.analysis.summary && (
                  <SummaryStats summary={data.analysis.summary} analysis={data.analysis} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
