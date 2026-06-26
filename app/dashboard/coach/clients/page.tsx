import type { Metadata } from 'next';
import { CoachClientsPage } from '@/components/coach';

export const metadata: Metadata = { title: 'Coach Panel' };

export default function CoachClientsRoute() {
  return <CoachClientsPage />;
}
