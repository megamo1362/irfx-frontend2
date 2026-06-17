'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, BarChart2, Cpu, CreditCard, KeyRound } from 'lucide-react';
import { StatCard } from '@/components/shared';
import { apiFetch } from '@/lib/api';
import type { AdminStats } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AdminStats>('/admin/stats')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">داشبورد مدیریت</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">آمار کلی سیستم</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="کل کاربران" value={stats?.total_users ?? 0} icon={<Users className="w-4 h-4" />} loading={loading} />
        <StatCard label="کوچ‌ها" value={stats?.total_coaches ?? 0} icon={<UserCheck className="w-4 h-4" />} loading={loading} accentColor="#60a5fa" />
        <StatCard label="کلاینت‌ها" value={stats?.total_clients ?? 0} icon={<BarChart2 className="w-4 h-4" />} loading={loading} accentColor="#22c55e" />
        <StatCard label="حساب‌های MT5" value={stats?.total_mt5_accounts ?? 0} icon={<Cpu className="w-4 h-4" />} loading={loading} accentColor="#f59e0b" />
        <StatCard label="اشتراک‌های فعال" value={stats?.active_subscriptions ?? 0} icon={<CreditCard className="w-4 h-4" />} loading={loading} accentColor="#a78bfa" />
        <StatCard label="کدهای باز" value={stats?.unused_invite_codes ?? 0} icon={<KeyRound className="w-4 h-4" />} loading={loading} accentColor="#2dd4bf" />
      </div>
    </div>
  );
}
