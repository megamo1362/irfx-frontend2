import type { Metadata } from 'next';
import { AnalysisPage } from '@/components/analysis';

export const metadata: Metadata = { title: 'آنالیز حساب | Zenvora' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnalyzeRoute({ params }: Props) {
  const { id } = await params;
  return <AnalysisPage id={id} />;
}
