'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Clock, Zap, ArrowRight, Printer, CalendarRange } from 'lucide-react';
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
import { AIPsychologyCard } from './ai-psychology';
import { useCheckAndRun, useRealtimeAnalysis, useUserFeatures, useFilteredAnalysis } from '@/hooks/use-analysis';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useLang } from '@/app/i18n/LangContext';
import type { Analysis, Trade, OpenPosition } from '@/types';

type DatePreset = 'all' | 'this_week' | 'this_month' | 'last_month' | '3_months' | '6_months' | '1_year' | 'custom';

const PRESET_LABELS: Record<DatePreset, { en: string; fa: string }> = {
  all:        { en: 'All Time',      fa: 'همه' },
  this_week:  { en: 'This Week',     fa: 'هفته جاری' },
  this_month: { en: 'This Month',    fa: 'ماه جاری' },
  last_month: { en: 'Last Month',    fa: 'ماه گذشته' },
  '3_months': { en: 'Last 3 Months', fa: '۳ ماه گذشته' },
  '6_months': { en: 'Last 6 Months', fa: '۶ ماه گذشته' },
  '1_year':   { en: 'Last Year',     fa: 'یک سال گذشته' },
  custom:     { en: 'Custom',        fa: 'بازه دلخواه' },
};

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getPresetRange(preset: DatePreset): { from: string; to: string } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === 'all' || preset === 'custom') return null;
  if (preset === 'this_week') {
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    return { from: toYMD(monday), to: toYMD(now) };
  }
  if (preset === 'this_month') return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(now) };
  if (preset === 'last_month') {
    return {
      from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to:   toYMD(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }
  if (preset === '3_months') { const f = new Date(now); f.setMonth(f.getMonth() - 3); return { from: toYMD(f), to: toYMD(now) }; }
  if (preset === '6_months') { const f = new Date(now); f.setMonth(f.getMonth() - 6); return { from: toYMD(f), to: toYMD(now) }; }
  if (preset === '1_year')   { const f = new Date(now); f.setFullYear(f.getFullYear() - 1); return { from: toYMD(f), to: toYMD(now) }; }
  return null;
}

interface PageData {
  balance: number | null;
  equity: number | null;
  analysis: Analysis;
  trades: Trade[];
  openPositions: OpenPosition[];
  snapshotTime: string | null;
  hoursUntilNext: number | null;
  hoursSinceUpdate: number | null;
}

type TabKey = 'summary' | 'trades' | 'time' | 'symbols' | 'equity';

export function AnalysisPage({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const isCoachMode = searchParams?.get('coach') === 'true';
  const { t, lang } = useLang();
  const l = lang === 'fa' ? 'fa' : 'en';

  const { mutate: checkAndRun, isPending: initialLoading } = useCheckAndRun();
  const { mutate: runRealtime, isPending: realtimeLoading } = useRealtimeAnalysis();
  const { mutate: runFiltered, isPending: filterLoading } = useFilteredAnalysis();
  const { data: features } = useUserFeatures();

  const [allTimeData, setAllTimeData] = useState<PageData | null>(null);
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printTabs, setPrintTabs] = useState<Set<TabKey>>(
    new Set(['summary', 'trades', 'time', 'symbols', 'equity'] as TabKey[])
  );
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

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
          const d: PageData = {
            balance: snap.balance ?? null,
            equity: snap.equity ?? null,
            analysis: snap.analysis,
            trades: snap.trades ?? [],
            openPositions: snap.open_positions ?? [],
            snapshotTime: snap.snapshot_time ?? null,
            hoursUntilNext: snap.hours_until_next ?? null,
            hoursSinceUpdate: snap.hours_since_update ?? null,
          };
          setAllTimeData(d);
          setData(d);
        }
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : t.analysis_error_load);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = useCallback((preset: DatePreset, from: string, to: string) => {
    if (preset === 'all') {
      setData(allTimeData);
      return;
    }

    let fromDate: string;
    let toDate: string;

    if (preset === 'custom') {
      if (!from || !to) return;
      fromDate = from;
      toDate = to;
    } else {
      const range = getPresetRange(preset);
      if (!range) return;
      fromDate = range.from;
      toDate = range.to;
    }

    runFiltered(
      { id, fromDate, toDate },
      {
        onSuccess: (result) => {
          setData(prev => ({
            balance: prev?.balance ?? null,
            equity: prev?.equity ?? null,
            snapshotTime: prev?.snapshotTime ?? null,
            hoursUntilNext: prev?.hoursUntilNext ?? null,
            hoursSinceUpdate: prev?.hoursSinceUpdate ?? null,
            analysis: result.analysis,
            trades: result.trades,
            openPositions: prev?.openPositions ?? [],
          }));
        },
        onError: () => {
          setDatePreset('all');
          setData(allTimeData);
        },
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTimeData, id]);

  const handleRealtime = () => {
    setError(null);
    runRealtime(id, {
      onSuccess: (result) => {
        const d: PageData = {
          balance: result.balance ?? null,
          equity: result.equity ?? null,
          analysis: result.analysis,
          trades: result.trades ?? [],
          openPositions: result.open_positions ?? [],
          snapshotTime: null,
          hoursUntilNext: null,
          hoursSinceUpdate: null,
        };
        setAllTimeData(d);
        setData(d);
        setDatePreset('all');
      },
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : t.analysis_error_run);
      },
    });
  };

  const togglePrintTab = (key: TabKey) => {
    setPrintTabs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handlePrintConfirm = () => {
    setShowPrintDialog(false);
    setTimeout(() => window.print(), 150);
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      applyFilter(preset, customFrom, customTo);
    }
  };

  const handleCustomApply = () => {
    applyFilter('custom', customFrom, customTo);
  };

  const canRunRealtime = !isCoachMode && (features?.realtime_analysis ?? false);
  const realTrades = (data?.trades ?? []).filter(t => [0, 1].includes(t.type) && t.volume > 0 && t.profit !== 0);
  const openCount = data?.openPositions?.length ?? 0;
  const tradesTabCount = realTrades.length + openCount;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'summary', label: t.analysis_tab_summary },
    { key: 'trades', label: `${t.analysis_tab_trades} (${tradesTabCount})` },
    { key: 'time', label: t.analysis_tab_time },
    { key: 'symbols', label: t.analysis_tab_symbols },
    { key: 'equity', label: t.analysis_tab_charts },
  ];

  return (
    <>
    {/* PDF Section Dialog */}
    {showPrintDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
        <div className="card-surface rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4 border border-[var(--color-border)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            {lang === 'fa' ? 'انتخاب بخش‌های PDF' : 'Select PDF Sections'}
          </h2>
          <div className="space-y-3">
            {tabs.map(tab => (
              <label key={tab.key} className="flex items-center gap-3 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={printTabs.has(tab.key)}
                  onChange={() => togglePrintTab(tab.key)}
                  className="w-4 h-4 accent-[var(--color-cyan)] cursor-pointer rounded"
                />
                <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                  {tab.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowPrintDialog(false)}>
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handlePrintConfirm}
              disabled={printTabs.size === 0}
            >
              <Printer className="h-3.5 w-3.5 ml-1.5" />
              {lang === 'fa' ? 'دریافت PDF' : 'Print PDF'}
            </Button>
          </div>
        </div>
      </div>
    )}
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
              onClick={() => setShowPrintDialog(true)}
            >
              <Printer className="h-3.5 w-3.5 ml-1.5" />
              {lang === 'fa' ? 'خروجی PDF' : 'Export PDF'}
            </Button>
          )}
        </div>
      </div>

      {/* Date filter — only shown when data is available */}
      {data && (
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <CalendarRange className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {(Object.keys(PRESET_LABELS) as DatePreset[]).map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetChange(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  datePreset === preset
                    ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.3)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                {PRESET_LABELS[preset][l]}
              </button>
            ))}
          </div>
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
              />
              <span className="text-xs text-[var(--color-text-muted)]">—</span>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo || filterLoading}
              >
                {l === 'fa' ? 'اعمال' : 'Apply'}
              </Button>
            </div>
          )}
          {filterLoading && (
            <span className="text-xs text-[var(--color-text-muted)] animate-pulse">
              {l === 'fa' ? 'در حال محاسبه...' : 'Recalculating...'}
            </span>
          )}
          {datePreset !== 'all' && !filterLoading && (
            <span className="text-xs text-[var(--color-cyan)] font-medium">
              {realTrades.length} {l === 'fa' ? 'معامله' : 'trades'}
            </span>
          )}
        </div>
      )}

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

          {/* AI Psychology Analysis */}
          {data.analysis.has_data && !isCoachMode && (() => {
            const aiRange = datePreset !== 'all' && datePreset !== 'custom' ? getPresetRange(datePreset) : null;
            const aiFrom = aiRange?.from ?? (datePreset === 'custom' && customFrom ? customFrom : undefined);
            const aiTo   = aiRange?.to   ?? (datePreset === 'custom' && customTo   ? customTo   : undefined);
            return (
              <AIPsychologyCard accountId={id} fromDate={aiFrom} toDate={aiTo} />
            );
          })()}

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
                      openPositions={data.openPositions}
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

              {/* Print-only: render selected tabs */}
              <div className="hidden print:block space-y-6">
                {printTabs.has('summary') && data.analysis.summary && (
                  <SummaryStats summary={data.analysis.summary} analysis={data.analysis} />
                )}
                {printTabs.has('trades') && (
                  <TradesTable trades={data.trades} openPositions={data.openPositions} accountId={id} showJournal={!isCoachMode} />
                )}
                {printTabs.has('time') && (
                  <TimeAnalysis data={data.analysis.time_analysis ?? []} />
                )}
                {printTabs.has('symbols') && (
                  <SymbolAnalysis data={data.analysis.symbol_analysis ?? []} />
                )}
                {printTabs.has('equity') && (
                  <ChartTabs accountId={id} />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
    </>
  );
}
