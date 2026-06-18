'use client';

import { useState, useId } from 'react';
import { InlineLoader } from '@/components/shared';
import { useCharts } from '@/hooks/use-analysis';
import type { ChartPt } from '@/types';

// ── SVG layout ─────────────────────────────────────────────────────────────────
const W = 900, H = 300, PL = 72, PR = 24, PT = 28, PB = 46;
const CW = W - PL - PR, CH = H - PT - PB;

// ── Helpers ────────────────────────────────────────────────────────────────────
function toX(i: number, n: number) { return PL + (i / Math.max(n - 1, 1)) * CW; }
function toY(v: number, lo: number, hi: number) { return PT + ((hi - v) / (hi - lo || 1)) * CH; }

function fmtDollar(v: number) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}
function fmtPct(v: number) { return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`; }
function shortDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(5, 10);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`;
}
function polyPts(pts: ChartPt[], lo: number, hi: number) {
  return pts.map((p, i) => `${toX(i, pts.length).toFixed(1)},${toY(p.value, lo, hi).toFixed(1)}`).join(' ');
}
function timeIdxsFor(n: number): number[] {
  if (n <= 1) return [0];
  if (n <= 5) return Array.from({ length: n }, (_, i) => i);
  return [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor(n * 3 / 4), n - 1];
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptyChart({ message = 'داده‌ای یافت نشد' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center text-[var(--color-text-muted)] text-sm" style={{ height: 300 }}>
      {message}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex gap-5 justify-end mb-3 flex-wrap">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <svg width="20" height="8" style={{ display: 'block', flexShrink: 0 }}>
            <line x1="0" y1="4" x2="20" y2="4"
              stroke={item.color} strokeWidth={item.dashed ? 1.5 : 2}
              strokeDasharray={item.dashed ? '4,2' : undefined}
              strokeLinecap="round" />
          </svg>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function ChartDefs({ uid, primaryColor }: { uid: string; primaryColor: string }) {
  return (
    <defs>
      <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
        <stop offset="80%" stopColor={primaryColor} stopOpacity="0.03" />
        <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
      </linearGradient>
      <filter id={`glow-${uid}`}>
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function ChartGrid({
  lo, hi, yFmt, pts,
}: { lo: number; hi: number; yFmt: (v: number) => string; pts: ChartPt[] }) {
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + t * CH, v: hi - t * (hi - lo) }));
  const idxs = timeIdxsFor(pts.length);
  return (
    <g>
      {gridYs.map((g, i) => (
        <g key={i}>
          <line x1={PL} y1={g.y} x2={W - PR} y2={g.y}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x={PL - 8} y={g.y + 4} fill="rgba(255,255,255,0.22)"
            fontSize="9.5" textAnchor="end" fontFamily="monospace">
            {yFmt(g.v)}
          </text>
        </g>
      ))}
      {idxs.filter(i => pts[i]).map(i => (
        <text key={i} x={toX(i, pts.length).toFixed(1)} y={H - 10}
          fill="rgba(255,255,255,0.22)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
          {shortDate(pts[i].time)}
        </text>
      ))}
    </g>
  );
}

function Tooltip({
  time, entries, onLeft,
}: { time: string; entries: { label: string; value: string; color: string }[]; onLeft?: boolean }) {
  return (
    <div
      className="absolute top-3 pointer-events-none z-10"
      style={{ [onLeft ? 'left' : 'right']: 12 }}
    >
      <div
        className="rounded-xl px-3 py-2.5 text-xs min-w-[148px] shadow-2xl"
        style={{
          background: 'rgba(8,18,28,0.94)',
          border: '1px solid rgba(0,212,255,0.14)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p className="mb-1.5 font-mono leading-none" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
          {time.slice(0, 16).replace('T', '  ')}
        </p>
        {entries.map(e => (
          <div key={e.label} className="flex items-center justify-between gap-4 leading-6">
            <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: e.color }} />
              {e.label}
            </span>
            <span className="font-bold tabular-nums" style={{ color: e.color }}>
              {e.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SvgLineChart ───────────────────────────────────────────────────────────────
interface LineSeries {
  pts: ChartPt[];
  color: string;
  name: string;
  label: string;
  dashed?: boolean;
  segmentColor?: boolean; // green when ≥0, red when <0
}

function SvgLineChart({
  series,
  yFmt = fmtPct,
  refZero = false,
}: {
  series: LineSeries[];
  yFmt?: (v: number) => string;
  refZero?: boolean;
}) {
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const primary = series.find(s => s.pts.length > 0);
  if (!primary) return <EmptyChart />;
  const n = primary.pts.length;

  const allVals = series.flatMap(s => s.pts.map(p => p.value));
  const rawLo = Math.min(...allVals), rawHi = Math.max(...allVals);
  const rng = rawHi - rawLo || 1;
  const lo = rawLo - rng * 0.09, hi = rawHi + rng * 0.09;

  const zeroY = lo <= 0 && hi >= 0 ? toY(0, lo, hi) : null;
  const baseY = PT + CH;
  const areaPoints = n >= 2
    ? `${toX(0, n).toFixed(1)},${baseY.toFixed(1)} ${polyPts(primary.pts, lo, hi)} ${toX(n - 1, n).toFixed(1)},${baseY.toFixed(1)}`
    : '';

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const chartX = Math.max(0, Math.min(((e.clientX - r.left) / r.width) * W - PL, CW));
    setHoverIdx(Math.max(0, Math.min(Math.round((chartX / CW) * (n - 1)), n - 1)));
  };

  const hX = hoverIdx !== null ? toX(hoverIdx, n) : 0;
  const onLeft = (hoverIdx ?? 0) > n * 0.6;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`} className="w-full select-none cursor-crosshair"
        style={{ height: 300 }}
        onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}
      >
        <ChartDefs uid={uid} primaryColor={primary.color} />
        <ChartGrid lo={lo} hi={hi} yFmt={yFmt} pts={primary.pts} />

        {refZero && zeroY !== null && (
          <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY}
            stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="4,4" />
        )}

        {n >= 2 && <polygon points={areaPoints} fill={`url(#grad-${uid})`} />}

        {series.map((s, si) => {
          if (s.pts.length < 2) return null;
          if (s.segmentColor) {
            return (
              <g key={s.name} filter={`url(#glow-${uid})`}>
                {s.pts.slice(1).map((p, i) => (
                  <line key={i}
                    x1={toX(i, n).toFixed(1)} y1={toY(s.pts[i].value, lo, hi).toFixed(1)}
                    x2={toX(i + 1, n).toFixed(1)} y2={toY(p.value, lo, hi).toFixed(1)}
                    stroke={p.value >= 0 ? '#10b981' : '#ef4444'}
                    strokeWidth="2.3" strokeLinecap="round"
                  />
                ))}
              </g>
            );
          }
          return (
            <polyline key={s.name}
              fill="none" stroke={s.color}
              strokeWidth={si === 0 ? 2.2 : 1.5}
              strokeDasharray={s.dashed ? '6,3' : undefined}
              strokeLinecap="round" strokeLinejoin="round"
              filter={si === 0 ? `url(#glow-${uid})` : undefined}
              points={polyPts(s.pts, lo, hi)}
            />
          );
        })}

        {hoverIdx !== null && (
          <>
            <line x1={hX} y1={PT} x2={hX} y2={PT + CH}
              stroke="rgba(0,212,255,0.18)" strokeWidth="1" />
            {series.map((s, si) => {
              const pt = s.pts[hoverIdx];
              if (!pt) return null;
              const dotColor = s.segmentColor ? (pt.value >= 0 ? '#10b981' : '#ef4444') : s.color;
              return (
                <circle key={si} cx={hX.toFixed(1)} cy={toY(pt.value, lo, hi).toFixed(1)}
                  r={si === 0 ? 5 : 3.5}
                  fill={dotColor} stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
              );
            })}
          </>
        )}
      </svg>

      {hoverIdx !== null && primary.pts[hoverIdx] && (
        <Tooltip
          time={primary.pts[hoverIdx].time} onLeft={onLeft}
          entries={series
            .filter(s => s.pts[hoverIdx] != null)
            .map(s => ({
              label: s.label,
              color: s.segmentColor
                ? (s.pts[hoverIdx]!.value >= 0 ? '#10b981' : '#ef4444')
                : s.color,
              value: yFmt(s.pts[hoverIdx]!.value),
            }))}
        />
      )}
    </div>
  );
}

// ── SvgDualChart (profit: bars + cumulative line) ──────────────────────────────
function SvgDualChart({ bars, line }: { bars: ChartPt[]; line: ChartPt[] }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const primary = bars.length > 0 ? bars : line;
  if (primary.length === 0) return <EmptyChart />;
  const n = primary.length;

  const allVals = [...bars.map(p => p.value), ...line.map(p => p.value), 0];
  const rawLo = Math.min(...allVals), rawHi = Math.max(...allVals);
  const rng = rawHi - rawLo || 1;
  const lo = rawLo - rng * 0.06, hi = rawHi + rng * 0.1;
  const zeroY = toY(0, lo, hi);
  const slotW = CW / n;
  const barW = Math.max(2, slotW * 0.6);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const chartX = Math.max(0, Math.min(((e.clientX - r.left) / r.width) * W - PL, CW));
    setHoverIdx(Math.max(0, Math.min(Math.floor((chartX / CW) * n), n - 1)));
  };

  const hX = hoverIdx !== null ? PL + (hoverIdx + 0.5) * slotW : 0;
  const onLeft = (hoverIdx ?? 0) > n * 0.6;
  const hoverBar = hoverIdx !== null ? bars[hoverIdx] : undefined;
  const hoverLine = hoverIdx !== null ? line[hoverIdx] : undefined;
  const hoverBarCy = hoverBar
    ? (hoverBar.value >= 0
        ? zeroY - Math.abs(hoverBar.value / (hi - lo || 1)) * CH
        : zeroY + Math.abs(hoverBar.value / (hi - lo || 1)) * CH)
    : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`} className="w-full select-none cursor-crosshair"
        style={{ height: 300 }}
        onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}
      >
        <ChartDefs uid={uid} primaryColor="#F59E0B" />
        <ChartGrid lo={lo} hi={hi} yFmt={fmtDollar} pts={primary} />

        <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY}
          stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="4,4" />

        {bars.map((p, i) => {
          const cx = PL + (i + 0.5) * slotW;
          const barH = Math.max(2, Math.abs(p.value / (hi - lo || 1)) * CH);
          const barY = p.value >= 0 ? zeroY - barH : zeroY;
          return (
            <rect key={i}
              x={(cx - barW / 2).toFixed(1)} y={barY.toFixed(1)}
              width={barW.toFixed(1)} height={barH.toFixed(1)}
              fill={p.value >= 0 ? '#10b981' : '#ef4444'}
              opacity={hoverIdx === i ? 1 : 0.7}
              rx="1.5"
            />
          );
        })}

        {line.length >= 2 && (
          <polyline
            fill="none" stroke="#F59E0B" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            filter={`url(#glow-${uid})`}
            points={line.map((p, i) =>
              `${(PL + (i + 0.5) * slotW).toFixed(1)},${toY(p.value, lo, hi).toFixed(1)}`
            ).join(' ')}
          />
        )}

        {hoverIdx !== null && (
          <>
            <line x1={hX} y1={PT} x2={hX} y2={PT + CH}
              stroke="rgba(0,212,255,0.18)" strokeWidth="1" />
            {hoverBar && (
              <circle cx={hX.toFixed(1)} cy={hoverBarCy.toFixed(1)} r={4}
                fill={hoverBar.value >= 0 ? '#10b981' : '#ef4444'}
                stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
            )}
            {hoverLine && (
              <circle cx={hX.toFixed(1)} cy={toY(hoverLine.value, lo, hi).toFixed(1)} r={5}
                fill="#F59E0B" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
            )}
          </>
        )}
      </svg>

      {hoverIdx !== null && (hoverBar ?? hoverLine) && (
        <Tooltip
          time={(hoverBar ?? hoverLine)!.time}
          onLeft={onLeft}
          entries={[
            ...(hoverBar ? [{
              label: 'معامله',
              color: hoverBar.value >= 0 ? '#10b981' : '#ef4444',
              value: fmtDollar(hoverBar.value),
            }] : []),
            ...(hoverLine ? [{
              label: 'تجمعی',
              color: '#F59E0B',
              value: fmtDollar(hoverLine.value),
            }] : []),
          ]}
        />
      )}
    </div>
  );
}

// ── SvgDrawdownChart ───────────────────────────────────────────────────────────
function SvgDrawdownChart({ pts }: { pts: ChartPt[] }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (pts.length === 0) return <EmptyChart />;
  const n = pts.length;

  const maxVal = Math.max(...pts.map(p => p.value), 0.1);
  const hi = maxVal * 1.14;
  const slotW = CW / n;
  const barW = Math.max(2, slotW * 0.72);
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: PT + t * CH, v: hi * (1 - t) }));
  const idxs = timeIdxsFor(n);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const chartX = Math.max(0, Math.min(((e.clientX - r.left) / r.width) * W - PL, CW));
    setHoverIdx(Math.max(0, Math.min(Math.floor((chartX / CW) * n), n - 1)));
  };

  const hX = hoverIdx !== null ? PL + (hoverIdx + 0.5) * slotW : 0;
  const onLeft = (hoverIdx ?? 0) > n * 0.6;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`} className="w-full select-none cursor-crosshair"
        style={{ height: 300 }}
        onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`dd-lo-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`dd-hi-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {gridYs.map((g, i) => (
          <g key={i}>
            <line x1={PL} y1={g.y} x2={W - PR} y2={g.y}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <text x={PL - 8} y={g.y + 4} fill="rgba(255,255,255,0.22)"
              fontSize="9.5" textAnchor="end" fontFamily="monospace">
              {fmtPct(g.v)}
            </text>
          </g>
        ))}

        {pts.map((p, i) => {
          const cx = PL + (i + 0.5) * slotW;
          const barH = Math.max(2, (p.value / hi) * CH);
          const y = PT + CH - barH;
          const isLarge = p.value > maxVal * 0.4;
          return (
            <rect key={i}
              x={(cx - barW / 2).toFixed(1)} y={y.toFixed(1)}
              width={barW.toFixed(1)} height={barH.toFixed(1)}
              fill={`url(#${isLarge ? `dd-lo-${uid}` : `dd-hi-${uid}`})`}
              opacity={hoverIdx === i ? 1 : 0.85}
              rx="2"
            />
          );
        })}

        {hoverIdx !== null && (
          <line x1={hX} y1={PT} x2={hX} y2={PT + CH}
            stroke="rgba(0,212,255,0.18)" strokeWidth="1" />
        )}

        {idxs.filter(i => pts[i]).map(i => (
          <text key={i} x={(PL + (i + 0.5) * slotW).toFixed(1)} y={H - 10}
            fill="rgba(255,255,255,0.22)" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
            {shortDate(pts[i].time)}
          </text>
        ))}
      </svg>

      {hoverIdx !== null && pts[hoverIdx] && (
        <Tooltip
          time={pts[hoverIdx].time} onLeft={onLeft}
          entries={[{
            label: 'افت',
            color: pts[hoverIdx].value > maxVal * 0.4 ? '#f97316' : '#ef4444',
            value: fmtPct(pts[hoverIdx].value),
          }]}
        />
      )}
    </div>
  );
}

// ── ChartTabs ──────────────────────────────────────────────────────────────────
type ChartTabKey = 'growth' | 'balance' | 'profit' | 'drawdown' | 'margin';

const TABS: { key: ChartTabKey; label: string }[] = [
  { key: 'growth',   label: 'رشد'        },
  { key: 'balance',  label: 'بالانس'     },
  { key: 'profit',   label: 'سود و زیان' },
  { key: 'drawdown', label: 'افت'        },
  { key: 'margin',   label: 'مارجین'     },
];

export function ChartTabs({ accountId }: { accountId: string | number }) {
  const [active, setActive] = useState<ChartTabKey>('growth');
  const { data, isLoading, isError } = useCharts(accountId);

  if (isLoading) return <InlineLoader label="در حال بارگذاری نمودار‌ها..." />;
  if (isError || !data) {
    return (
      <div className="card-surface rounded-2xl p-8 text-center text-sm text-[var(--color-text-muted)]">
        خطا در بارگذاری داده‌های نمودار
      </div>
    );
  }

  const s = data.series;

  // Show MAE/MFE lines only when they have meaningful difference from balance_growth
  const hasMaeMfe =
    s.growth.mfe_growth.length > 0 &&
    s.growth.mfe_growth.some(
      (p, i) => Math.abs(p.value - (s.growth.balance_growth[i]?.value ?? p.value)) > 0.01
    );

  return (
    <div className="space-y-3">
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

      <div className="card-surface rounded-2xl p-4">
        {active === 'growth' && (
          <>
            <Legend items={[
              { label: 'رشد', color: '#10b981' },
              ...(hasMaeMfe ? [
                { label: 'سقف MFE', color: '#38bdf8', dashed: true },
                { label: 'کف MAE',  color: '#f87171', dashed: true },
              ] : []),
            ]} />
            <SvgLineChart
              refZero
              yFmt={fmtPct}
              series={[
                { name: 'balance_growth', pts: s.growth.balance_growth, color: '#10b981', label: 'رشد', segmentColor: true },
                ...(hasMaeMfe ? [
                  { name: 'mfe_growth', pts: s.growth.mfe_growth, color: '#38bdf8', label: 'سقف MFE', dashed: true },
                  { name: 'mae_growth', pts: s.growth.mae_growth, color: '#f87171', label: 'کف MAE',  dashed: true },
                ] : []),
              ]}
            />
          </>
        )}

        {active === 'balance' && (
          <>
            <Legend items={[{ label: 'بالانس', color: '#38bdf8' }]} />
            <SvgLineChart
              yFmt={fmtDollar}
              series={[{ name: 'balance', pts: s.balance.balance, color: '#38bdf8', label: 'بالانس', segmentColor: false }]}
            />
          </>
        )}

        {active === 'profit' && (
          <>
            <Legend items={[
              { label: 'سود هر معامله', color: '#10b981' },
              { label: 'سود تجمعی',     color: '#F59E0B' },
            ]} />
            <SvgDualChart bars={s.profit.per_trade ?? []} line={s.profit.profit} />
          </>
        )}

        {active === 'drawdown' && (
          <>
            <Legend items={[{ label: 'افت سرمایه', color: '#ef4444' }]} />
            <SvgDrawdownChart pts={s.drawdown.drawdown} />
          </>
        )}

        {active === 'margin' && (
          s.margin.margin.length > 0 ? (
            <>
              <Legend items={[{ label: 'مارجین', color: '#818cf8' }]} />
              <SvgLineChart
                yFmt={fmtPct}
                series={[{ name: 'margin', pts: s.margin.margin, color: '#818cf8', label: 'مارجین' }]}
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
