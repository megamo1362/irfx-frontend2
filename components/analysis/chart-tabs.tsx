'use client';

import { useState } from 'react';
import { InlineLoader } from '@/components/shared';
import { useCharts } from '@/hooks/use-analysis';
import type { ChartPt } from '@/types';

// ── SVG layout ─────────────────────────────────────────────────────────────────
const W = 900, H = 300;
const PL = 66, PR = 20, PT = 28, PB = 44;
const CW = W - PL - PR, CH = H - PT - PB;

function toX(i: number, n: number) {
  return PL + (i / Math.max(n - 1, 1)) * CW;
}
function toY(v: number, lo: number, hi: number) {
  return PT + ((hi - v) / (hi - lo || 1)) * CH;
}
function fmtDollar(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }
function shortDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyChart({ message = 'داده‌ای یافت نشد' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center text-[var(--color-text-muted)] text-sm" style={{ height: 300 }}>
      {message}
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex gap-4 justify-end mb-2 flex-wrap">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <span className="inline-block w-4 rounded" style={{ height: 2, backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ── Line chart ─────────────────────────────────────────────────────────────────
interface LineSeries { pts: ChartPt[]; color: string; name: string; }

function SvgLineChart({
  series,
  yFmt = fmtPct,
  refZero = false,
}: {
  series: LineSeries[];
  yFmt?: (v: number) => string;
  refZero?: boolean;
}) {
  const allPts = series.flatMap(s => s.pts);
  if (allPts.length === 0) return <EmptyChart />;

  const allVals = allPts.map(p => p.value);
  const rawLo = Math.min(...allVals), rawHi = Math.max(...allVals);
  const pad = (rawHi - rawLo) * 0.07 || 1;
  const lo = rawLo - pad, hi = rawHi + pad;

  const n = series[0]?.pts.length ?? 0;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: PT + t * CH,
    v: hi - t * (hi - lo),
  }));
  const timeIdxs = n > 1
    ? [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(n * 3 / 4), n - 1]
    : [0];

  const zeroY = lo <= 0 && hi >= 0 ? toY(0, lo, hi) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 300 }}>
      {gridYs.map((g, i) => (
        <g key={i}>
          <line x1={PL} y1={g.y} x2={W - PR} y2={g.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x={PL - 6} y={g.y + 4} fill="#4a6a80" fontSize="9" textAnchor="end">{yFmt(g.v)}</text>
        </g>
      ))}

      {refZero && zeroY !== null && (
        <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY}
          stroke="rgba(160,160,160,0.35)" strokeWidth="1" strokeDasharray="5,3" />
      )}

      {series.map(s => {
        if (s.pts.length < 2) return null;
        const points = s.pts
          .map((p, i) => `${toX(i, s.pts.length).toFixed(1)},${toY(p.value, lo, hi).toFixed(1)}`)
          .join(' ');
        return (
          <polyline key={s.name} fill="none" stroke={s.color} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" points={points} />
        );
      })}

      {timeIdxs.filter(i => series[0]?.pts[i]).map(i => (
        <text key={i} x={toX(i, n).toFixed(1)} y={H - 8} fill="#4a6a80" fontSize="8" textAnchor="middle">
          {shortDate(series[0].pts[i].time)}
        </text>
      ))}
    </svg>
  );
}

// ── Bar chart (drawdown) ───────────────────────────────────────────────────────
function SvgBarChart({ pts, color }: { pts: ChartPt[]; color: string }) {
  if (pts.length === 0) return <EmptyChart />;

  const slotW = CW / pts.length;
  const barW = Math.max(1, slotW * 0.72);
  const hi = 100;

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: PT + t * CH,
    v: hi * (1 - t),
  }));
  const timeIdxs = pts.length > 1
    ? [0, Math.floor(pts.length / 4), Math.floor(pts.length / 2), Math.floor(pts.length * 3 / 4), pts.length - 1]
    : [0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 300 }}>
      {gridYs.map((g, i) => (
        <g key={i}>
          <line x1={PL} y1={g.y} x2={W - PR} y2={g.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x={PL - 6} y={g.y + 4} fill="#4a6a80" fontSize="9" textAnchor="end">{fmtPct(g.v)}</text>
        </g>
      ))}

      {pts.map((p, i) => {
        const cx = PL + (i + 0.5) * slotW;
        const barH = Math.max(1, (p.value / hi) * CH);
        const y = PT + CH - barH;
        return (
          <rect key={i} x={cx - barW / 2} y={y} width={barW} height={barH}
            fill={color} opacity="0.8" rx="1" />
        );
      })}

      {timeIdxs.filter(i => pts[i]).map(i => (
        <text key={i} x={(PL + (i + 0.5) * slotW).toFixed(1)} y={H - 8}
          fill="#4a6a80" fontSize="8" textAnchor="middle">
          {shortDate(pts[i].time)}
        </text>
      ))}
    </svg>
  );
}

// ── ChartTabs ──────────────────────────────────────────────────────────────────
type ChartTabKey = 'growth' | 'balance' | 'profit' | 'drawdown' | 'margin';

const TABS: { key: ChartTabKey; label: string }[] = [
  { key: 'growth',   label: 'Growth'   },
  { key: 'balance',  label: 'Balance'  },
  { key: 'profit',   label: 'Profit'   },
  { key: 'drawdown', label: 'Drawdown' },
  { key: 'margin',   label: 'Margin'   },
];

export function ChartTabs({ accountId }: { accountId: string | number }) {
  const [active, setActive] = useState<ChartTabKey>('growth');
  const { data, isLoading, isError } = useCharts(accountId);

  if (isLoading) return <InlineLoader label="در حال بارگذاری چارت‌ها..." />;

  if (isError || !data) {
    return (
      <div className="card-surface rounded-2xl p-8 text-center text-sm text-[var(--color-text-muted)]">
        خطا در بارگذاری داده‌های چارت
      </div>
    );
  }

  const s = data.series;

  return (
    <div className="space-y-3">
      {/* Sub-tabs — same style as parent page */}
      <div className="flex overflow-x-auto gap-0.5 p-1 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[var(--color-border)] w-fit max-w-full no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              active === t.key
                ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[rgba(0,212,255,0.2)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="card-surface rounded-2xl p-4">
        {active === 'growth' && (
          <>
            <Legend items={[
              { label: 'Growth',        color: '#F59E0B' },
              { label: 'Equity Growth', color: '#EF4444' },
            ]} />
            <SvgLineChart
              series={[
                { name: 'balance_growth', pts: s.growth.balance_growth, color: '#F59E0B' },
                { name: 'equity_growth',  pts: s.growth.equity_growth,  color: '#EF4444' },
              ]}
              yFmt={fmtPct}
              refZero
            />
          </>
        )}

        {active === 'balance' && (
          <>
            <Legend items={[
              { label: 'Balance', color: '#EF4444' },
              { label: 'Equity',  color: '#F59E0B' },
            ]} />
            <SvgLineChart
              series={[
                { name: 'balance', pts: s.balance.balance, color: '#EF4444' },
                { name: 'equity',  pts: s.balance.equity,  color: '#F59E0B' },
              ]}
              yFmt={fmtDollar}
            />
          </>
        )}

        {active === 'profit' && (
          <>
            <Legend items={[{ label: 'Profit', color: '#EF4444' }]} />
            <SvgLineChart
              series={[{ name: 'profit', pts: s.profit.profit, color: '#EF4444' }]}
              yFmt={fmtDollar}
              refZero
            />
          </>
        )}

        {active === 'drawdown' && (
          <>
            <Legend items={[{ label: 'Drawdown', color: '#EF4444' }]} />
            <SvgBarChart pts={s.drawdown.drawdown} color="#EF4444" />
          </>
        )}

        {active === 'margin' && (
          s.margin.margin.length > 0 ? (
            <>
              <Legend items={[{ label: 'Margin', color: '#3B82F6' }]} />
              <SvgLineChart
                series={[{ name: 'margin', pts: s.margin.margin, color: '#3B82F6' }]}
                yFmt={fmtPct}
              />
            </>
          ) : (
            <EmptyChart message="داده مارجین در دسترس نیست" />
          )
        )}
      </div>
    </div>
  );
}
