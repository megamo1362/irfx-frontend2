'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/types';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ users: AdminUser[]; total: number }>('/admin/users?role=coach')
      .then(d => { setCoaches(d.users ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">کوچ‌ها</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">مجموع: {total} کوچ</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : coaches.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-[var(--color-border)]">
          <p className="text-[var(--color-text-muted)]">هیچ کوچی ثبت‌نام نکرده است.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-deep)] text-[var(--color-text-muted)]">
                <th className="px-4 py-3 text-right">کوچ</th>
                <th className="px-4 py-3 text-center">پلن</th>
                <th className="px-4 py-3 text-center">وضعیت</th>
                <th className="px-4 py-3 text-center">تاریخ عضویت</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map(coach => (
                <tr key={coach.id} className="border-t border-[var(--color-border)] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)]">{coach.full_name || '—'}</p>
                    <p className="text-[var(--color-text-muted)] text-xs mt-0.5">{coach.email}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {coach.plan_name ? (
                      <span className="text-xs font-bold text-[var(--color-cyan)]">{coach.plan_name}</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={coach.is_active ? 'green' : 'red'} dot>
                      {coach.is_active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)] text-xs">
                    {new Date(coach.created_at).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
