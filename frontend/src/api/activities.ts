import { get, post, patch, del } from './client';
import type { Activity } from '../types';

export interface ActivityFilters {
  partnerId?: string;
  managerId?: string;
  type?: string;
  from?: string;
  to?: string;
}

export const activitiesApi = {
  getAll: (filters?: ActivityFilters) =>
    get<Activity[]>('/activities', filters as any),

  getOne: (id: string) => get<Activity>(`/activities/${id}`),

  create: (data: Partial<Activity>) => post<Activity>('/activities', data),

  update: (id: string, data: Partial<Activity>) =>
    patch<Activity>(`/activities/${id}`, data),

  remove: (id: string) => del(`/activities/${id}`),
};
