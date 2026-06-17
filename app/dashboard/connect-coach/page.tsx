import type { Metadata } from 'next';
import { ConnectCoachPage } from '@/components/coach';

export const metadata: Metadata = { title: 'اتصال به کوچ | Zenvora' };

export default function ConnectCoachRoute() {
  return <ConnectCoachPage />;
}
