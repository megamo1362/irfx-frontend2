'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLang } from '@/app/i18n/LangContext';
import type { JournalEntry } from '@/types';

const EMOTIONS_FA = ['ترس', 'طمع', 'هیجان', 'انضباط', 'خنثی', 'اعتماد به نفس کاذب', 'انتقام'];
const EMOTIONS_EN = ['Fear', 'Greed', 'Excitement', 'Discipline', 'Neutral', 'Overconfidence', 'Revenge'];

interface TradeRef {
  ticket: number;
  symbol: string;
  type: number;
  profit: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  accountId: number;
  entry?: JournalEntry | null;
  trade?: TradeRef | null;
}

const EMPTY = {
  pre_emotion: '', pre_reason: '', pre_strategy: '', pre_risk: '',
  post_emotion: '', post_lesson: '', post_rating: 0, post_followed_plan: false,
  tags: '', profit: '',
};

export function JournalModal({ open, onClose, onSaved, accountId, entry, trade }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { t, isRTL } = useLang();

  const emotions = isRTL ? EMOTIONS_FA : EMOTIONS_EN;

  useEffect(() => {
    if (entry) {
      setForm({
        pre_emotion: entry.pre_emotion ?? '',
        pre_reason: entry.pre_reason ?? '',
        pre_strategy: entry.pre_strategy ?? '',
        pre_risk: entry.pre_risk?.toString() ?? '',
        post_emotion: entry.post_emotion ?? '',
        post_lesson: entry.post_lesson ?? '',
        post_rating: entry.post_rating ?? 0,
        post_followed_plan: entry.post_followed_plan ?? false,
        tags: entry.tags ?? '',
        profit: entry.profit?.toString() ?? '',
      });
    } else if (trade) {
      setForm({ ...EMPTY, profit: trade.profit?.toString() ?? '' });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [entry, trade, open]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        account_id: accountId,
        ticket: entry?.ticket ?? trade?.ticket ?? null,
        symbol: entry?.symbol ?? trade?.symbol ?? null,
        trade_type: entry?.trade_type ?? (trade ? (trade.type === 0 ? 'buy' : 'sell') : null),
        pre_emotion: form.pre_emotion || null,
        pre_reason: form.pre_reason || null,
        pre_strategy: form.pre_strategy || null,
        pre_risk: form.pre_risk ? parseFloat(form.pre_risk) : null,
        post_emotion: form.post_emotion || null,
        post_lesson: form.post_lesson || null,
        post_rating: form.post_rating || null,
        post_followed_plan: form.post_followed_plan,
        tags: form.tags || null,
        profit: form.profit ? parseFloat(form.profit) : null,
      };
      if (entry) {
        await apiFetch(`/journal/${entry.id}`, { method: 'PUT', body });
      } else {
        await apiFetch('/journal/create', { method: 'POST', body });
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t.journal_save_error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{entry ? t.journal_modal_edit : t.journal_modal_create}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pl-1">
          {/* Pre-trade */}
          <div>
            <p className="text-xs font-bold text-[var(--color-cyan)] uppercase tracking-widest mb-3">{t.journal_pre_label}</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_emotion_label}</label>
                <Select value={form.pre_emotion} onValueChange={v => setForm(f => ({ ...f, pre_emotion: v }))}>
                  <SelectTrigger><SelectValue placeholder={t.journal_select_emotion} /></SelectTrigger>
                  <SelectContent>{emotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_entry_reason_label}</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.pre_reason}
                  onChange={e => setForm(f => ({ ...f, pre_reason: e.target.value }))}
                  placeholder={t.journal_reason_placeholder}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_strategy_label}</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.pre_strategy}
                  onChange={e => setForm(f => ({ ...f, pre_strategy: e.target.value }))}
                  placeholder={t.journal_strategy_placeholder}
                />
              </div>
              <Input
                label={t.journal_risk_label}
                type="number"
                placeholder={t.journal_risk_placeholder}
                value={form.pre_risk}
                onChange={e => setForm(f => ({ ...f, pre_risk: e.target.value }))}
              />
            </div>
          </div>

          {/* Post-trade */}
          <div>
            <p className="text-xs font-bold text-[var(--color-cyan)] uppercase tracking-widest mb-3">{t.journal_post_label}</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_emotion_label}</label>
                <Select value={form.post_emotion} onValueChange={v => setForm(f => ({ ...f, post_emotion: v }))}>
                  <SelectTrigger><SelectValue placeholder={t.journal_select_emotion} /></SelectTrigger>
                  <SelectContent>{emotions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_lesson_label}</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.post_lesson}
                  onChange={e => setForm(f => ({ ...f, post_lesson: e.target.value }))}
                  placeholder={t.journal_lesson_placeholder}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">{t.journal_rating_label}</label>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, post_rating: n }))}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        n <= form.post_rating
                          ? 'bg-[var(--color-cyan)] text-[var(--color-void)]'
                          : 'bg-[var(--color-elevated)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
                <span className="text-sm text-[var(--color-text-secondary)]">{t.journal_followed_plan_q}</span>
                <Switch
                  checked={form.post_followed_plan}
                  onCheckedChange={v => setForm(f => ({ ...f, post_followed_plan: v }))}
                />
              </div>
            </div>
          </div>

          {/* Other */}
          <div className="space-y-3">
            <Input
              label={t.journal_tags_label}
              placeholder={t.journal_tags_placeholder}
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
            <Input
              label={t.journal_pnl_label}
              type="number"
              placeholder="e.g. 45.50"
              value={form.profit}
              onChange={e => setForm(f => ({ ...f, profit: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-[var(--color-status-error)]">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>{t.cancel}</Button>
          <Button onClick={save} loading={saving}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
