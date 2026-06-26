import type { Metadata } from 'next';
import { ConnectCoachPage } from '@/components/coach';

export const metadata: Metadata = { title: 'Connect Coach | MINDLURA' };

export default function ConnectCoachRoute() {
  return <ConnectCoachPage />;
}
