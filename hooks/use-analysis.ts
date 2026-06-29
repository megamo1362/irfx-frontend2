'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { SnapshotResponse, UserFeatures, Journal, Trade, Analysis, ChartsData, OpenPosition } from '@/types';

export function useCheckAndRun() {
  return useMutation({
    mutationFn: (id: string | number) =>
      apiFetch<SnapshotResponse>(`/analysis/check-and-run/${id}`, { method: 'POST' }),
  });
}

export interface RealtimeResponse {
  balance: number;
  equity: number;
  analysis: Analysis;
  trades: Trade[];
  open_positions?: OpenPosition[];
}

export function useRealtimeAnalysis() {
  return useMutation({
    mutationFn: (id: string | number) =>
      apiFetch<RealtimeResponse>(`/trades/analyze/${id}`),
  });
}

export function useUserFeatures() {
  return useQuery({
    queryKey: QUERY_KEYS.features,
    queryFn: async () => {
      const data = await apiFetch<{ features: UserFeatures }>('/auth/me/features');
      return data.features;
    },
  });
}

export interface SaveJournalInput extends Journal {
  account_id: number;
  ticket: number;
  symbol: string;
  trade_type: 'buy' | 'sell';
  profit: number;
  journal_id?: number;
}

export function useCharts(accountId: string | number) {
  return useQuery({
    queryKey: ['charts', accountId],
    queryFn: () => apiFetch<ChartsData>(`/charts/${accountId}`),
    enabled: !!accountId,
  });
}

export interface FilteredAnalysisResponse {
  analysis: Analysis;
  trades: Trade[];
  balance: number | null;
  equity: number | null;
  total_trades: number;
}

export function useFilteredAnalysis() {
  return useMutation({
    mutationFn: ({ id, fromDate, toDate }: { id: string | number; fromDate: string; toDate: string }) =>
      apiFetch<FilteredAnalysisResponse>(
        `/analysis/${id}/filtered?from_date=${fromDate}&to_date=${toDate}`
      ),
  });
}

export function useSaveJournal() {
  return useMutation({
    mutationFn: ({ journal_id, ...data }: SaveJournalInput) => {
      if (journal_id) {
        return apiFetch(`/journal/${journal_id}`, { method: 'PUT', body: data });
      }
      return apiFetch('/journal/create', { method: 'POST', body: data });
    },
  });
}
