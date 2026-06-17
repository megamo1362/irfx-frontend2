'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JournalEntry } from '@/types';

const EMOTIONS = ['ترس', 'طمع', 'هیجان', 'انضباط', 'خنثی', 'اعتماد به نفس کاذب', 'انتقام'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  accountId: number;
  entry?: JournalEntry | null;
}

const EMPTY = {
  pre_emotion: '', pre_reason: '', pre_strategy: '', pre_risk: '',
  post_emotion: '', post_lesson: '', post_rating: 0, post_followed_plan: false,
  tags: '', profit: '',
};

export function JournalModal({ open, onClose, onSaved, accountId, entry }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [entry, open]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        account_id: accountId,
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
      setError(e instanceof Error ? e.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{entry ? 'ویرایش ژورنال' : 'ثبت ژورنال جدید'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pl-1" dir="rtl">
          {/* Pre-trade */}
          <div>
            <p className="text-xs font-bold text-[var(--color-cyan)] uppercase tracking-widest mb-3">قبل از معامله</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">احساس</label>
                <Select value={form.pre_emotion} onValueChange={v => setForm(f => ({ ...f, pre_emotion: v }))}>
                  <SelectTrigger><SelectValue placeholder="انتخاب احساس" /></SelectTrigger>
                  <SelectContent>{EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">دلیل ورود</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.pre_reason}
                  onChange={e => setForm(f => ({ ...f, pre_reason: e.target.value }))}
                  placeholder="چرا وارد این معامله شدی؟"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">استراتژی</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.pre_strategy}
                  onChange={e => setForm(f => ({ ...f, pre_strategy: e.target.value }))}
                  placeholder="استراتژی مورد استفاده"
                />
              </div>
              <Input
                label="ریسک (%)"
                type="number"
                placeholder="مثال: 1.5"
                value={form.pre_risk}
                onChange={e => setForm(f => ({ ...f, pre_risk: e.target.value }))}
              />
            </div>
          </div>

          {/* Post-trade */}
          <div>
            <p className="text-xs font-bold text-[var(--color-cyan)] uppercase tracking-widest mb-3">بعد از معامله</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">احساس</label>
                <Select value={form.post_emotion} onValueChange={v => setForm(f => ({ ...f, post_emotion: v }))}>
                  <SelectTrigger><SelectValue placeholder="انتخاب احساس" /></SelectTrigger>
                  <SelectContent>{EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">درس آموخته</label>
                <textarea
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] resize-none h-20 focus:outline-none focus:border-[var(--color-cyan)]"
                  value={form.post_lesson}
                  onChange={e => setForm(f => ({ ...f, post_lesson: e.target.value }))}
                  placeholder="چه چیزی یاد گرفتی؟"
                />
              </div>
              {/* Star rating 1-10 */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--color-text-muted)]">امتیاز معامله (۱-۱۰)</label>
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
                <span className="text-sm text-[var(--color-text-secondary)]">آیا به پلن پایبند بودی؟</span>
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
              label="تگ‌ها (با کاما جدا کن)"
              placeholder="مثال: breakout, london, XAUUSD"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
            <Input
              label="سود/زیان ($)"
              type="number"
              placeholder="مثال: 45.50"
              value={form.profit}
              onChange={e => setForm(f => ({ ...f, profit: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-[var(--color-status-error)]">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>انصراف</Button>
          <Button onClick={save} loading={saving}>ذخیره</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
