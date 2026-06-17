'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import type { SnapshotResponse, UserFeatures, Journal, Trade, Analysis } from '@/types';

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
