import type { Metadata } from 'next';
import { DashboardShell } from '@/components/layouts';

export const metadata: Metadata = {
  title: 'داشبورد | Zenvora',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
