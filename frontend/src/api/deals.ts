import { get, post, patch, del } from './client';
import type { Deal, DealStats } from '../types';

export interface DealFilters {
  partnerId?: string;
  status?: string;
  businessUnit?: string;
  from?: string;
  to?: string;
  search?: string;
}

export const dealsApi = {
  list: (filters?: DealFilters) => get<Deal[]>('/deals', filters),
  getStats: () => get<DealStats>('/deals/stats'),
  get: (id: string) => get<Deal>(`/deals/${id}`),
  create: (data: Partial<Deal>) => post<Deal>('/deals', data),
  update: (id: string, data: Partial<Deal>) => patch<Deal>(`/deals/${id}`, data),
  delete: (id: string) => del<void>(`/deals/${id}`),
};
