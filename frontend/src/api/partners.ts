import { get, post, patch, del } from './client';
import type { Partner, HistoryEntry, AiSummary, ParsedActivity } from '../types';

export interface PartnerFilters {
  domain?: string;
  priority?: string;
  status?: string;
  managerId?: string;
  search?: string;
}

export const partnersApi = {
  getAll: (filters?: PartnerFilters) =>
    get<Partner[]>('/partners', filters as any),

  getPublicList: (filters?: Pick<PartnerFilters, 'search' | 'domain' | 'priority'>) =>
    get<Partner[]>('/partners/public', filters as any),

  getPublicOne: (id: string) => get<Partner>(`/partners/public/${id}`),

  getOne: (id: string) => get<Partner>(`/partners/${id}`),

  create: (data: Partial<Partner>) => post<Partner>('/partners', data),

  update: (id: string, data: Partial<Partner>) =>
    patch<Partner>(`/partners/${id}`, data),

  remove: (id: string) => del(`/partners/${id}`),

  getHistory: (id: string) => get<HistoryEntry[]>(`/partners/${id}/history`),

  bulkRecalculate: () => post('/partners/recalculate'),

  getAiSummary: (id: string) => get<AiSummary>(`/partners/${id}/ai/summary`),

  parseActivity: (text: string) =>
    post<ParsedActivity>('/partners/ai/parse-activity', { text }),
};
