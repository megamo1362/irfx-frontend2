'use client';

import { useLang } from '@/app/i18n/LangContext';
import type { JournalAnalysisData } from '@/types';

interface Props {
  data: JournalAnalysisData | null;
  loading: boolean;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

export function JournalAnalysisView({ data, loading }: Props) {
  const { t } = useLang();

  const EMOTION_COLORS: Record<string, string> = {
    [t.emotion_fear]: '#ef4444', [t.emotion_greed]: '#f97316', [t.emotion_excitement]: '#eab308',
    [t.emotion_discipline]: '#22c55e', [t.emotion_neutral]: '#64748b',
    [t.emotion_overconfidence]: '#a855f7', [t.emotion_revenge]: '#ec4899',
    'Fear': '#ef4444', 'Greed': '#f97316', 'Excitement': '#eab308',
    'Discipline': '#22c55e', 'Neutral': '#64748b', 'Overconfidence': '#a855f7', 'Revenge': '#ec4899',
  };

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;
  }
  if (!data) return null;

  const totalEmotions = Object.values(data.emotion_distribution).reduce((a, b) => a + b, 0);
  const maxBar = Math.max(...Object.values(data.emotion_distribution), 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t.journal_total_entries} value={String(data.total_journals)} />
        <StatCard label={t.journal_avg_rating} value={data.avg_post_rating ? `${data.avg_post_rating}/10` : '—'} />
        <StatCard label={t.journal_plan_adherence} value={data.plan_followed_pct ? `${data.plan_followed_pct}%` : '—'} />
        <StatCard label={t.journal_emotions_logged} value={String(totalEmotions)} />
      </div>

      {/* Emotion distribution */}
      {Object.keys(data.emotion_distribution).length > 0 && (
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t.journal_emotion_dist_title}</p>
          <div className="space-y-2.5">
            {Object.entries(data.emotion_distribution)
              .sort(([, a], [, b]) => b - a)
              .map(([emotion, count]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] w-32 flex-shrink-0 text-right">{emotion}</span>
                  <div className="flex-1 h-5 bg-[var(--color-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxBar) * 100}%`,
                        backgroundColor: EMOTION_COLORS[emotion] ?? '#00d4ff',
                      }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] w-8 text-left">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Emotion vs P&L */}
      {data.emotion_pnl.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t.journal_emotion_pnl_title}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--color-text-muted)] text-xs">
                <th className="text-right pb-2">{t.journal_emotion_col}</th>
                <th className="text-center pb-2">{t.journal_avg_pnl_col}</th>
                <th className="text-center pb-2">{t.journal_count_col}</th>
              </tr>
            </thead>
            <tbody>
              {data.emotion_pnl.map(row => (
                <tr key={row.emotion} className="border-t border-[var(--color-border)]">
                  <td className="py-2 text-[var(--color-text-secondary)]">{row.emotion}</td>
                  <td className={`py-2 text-center font-bold ${row.avg_profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-status-error)]'}`}>
                    {row.avg_profit >= 0 ? '+' : ''}${row.avg_profit}
                  </td>
                  <td className="py-2 text-center text-[var(--color-text-muted)]">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan followed vs P&L */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-success)] font-bold mb-1">{t.journal_followed_yes}</p>
          <p className={`text-xl font-black ${data.plan_followed_pnl.followed.avg_profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-status-error)]'}`}>
            {data.plan_followed_pnl.followed.avg_profit >= 0 ? '+' : ''}${data.plan_followed_pnl.followed.avg_profit}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t.journal_trades(data.plan_followed_pnl.followed.count)}</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-status-error)] font-bold mb-1">{t.journal_followed_no}</p>
          <p className={`text-xl font-black ${data.plan_followed_pnl.not_followed.avg_profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-status-error)]'}`}>
            {data.plan_followed_pnl.not_followed.avg_profit >= 0 ? '+' : ''}${data.plan_followed_pnl.not_followed.avg_profit}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t.journal_trades(data.plan_followed_pnl.not_followed.count)}</p>
        </div>
      </div>

      {/* Top tags */}
      {data.top_tags.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t.journal_top_tags}</p>
          <div className="flex flex-wrap gap-2">
            {data.top_tags.map(({ tag, count }) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] text-sm">
                <span className="text-[var(--color-text-secondary)]">{tag}</span>
                <span className="text-xs text-[var(--color-cyan)] font-bold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Monthly activity */}
      {data.monthly_journal_count.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-sm font-bold text-[var(--color-text-primary)] mb-4">{t.journal_monthly}</p>
          <div className="flex items-end gap-2 h-32">
            {(() => {
              const maxCount = Math.max(...data.monthly_journal_count.map(m => m.count), 1);
              return data.monthly_journal_count.map(({ month, count }) => (
                <div key={month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-[10px] text-[var(--color-text-muted)]">{count}</span>
                  <div
                    className="w-full rounded-t-md bg-[var(--color-cyan)] opacity-80 transition-all"
                    style={{ height: `${(count / maxCount) * 90}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-[var(--color-text-muted)] truncate w-full text-center">{month.slice(5)}</span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
