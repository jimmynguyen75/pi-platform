import { get, post, patch, del } from './client';
import type { Fund, FundSummary } from '../types';

export interface FundFilters {
  partnerId?: string;
  fundType?: string;
  fiscalYear?: number;
  claimStatus?: string;
}

export const fundsApi = {
  list: (filters?: FundFilters) => get<Fund[]>('/funds', filters as any),
  getSummary: () => get<FundSummary>('/funds/summary'),
  get: (id: string) => get<Fund>(`/funds/${id}`),
  create: (data: Partial<Fund>) => post<Fund>('/funds', data),
  update: (id: string, data: Partial<Fund>) => patch<Fund>(`/funds/${id}`, data),
  delete: (id: string) => del<void>(`/funds/${id}`),
  seed: () => post<{ created: number }>('/funds/seed'),
};
