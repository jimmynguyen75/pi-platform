import { get, post, patch, del } from './client';
import type { Domain } from '../types';

export const domainsApi = {
  getAll: () => get<Domain[]>('/domains'),
  getOne: (id: string) => get<Domain>(`/domains/${id}`),
  create: (data: Partial<Domain>) => post<Domain>('/domains', data),
  update: (id: string, data: Partial<Domain>) => patch<Domain>(`/domains/${id}`, data),
  remove: (id: string) => del(`/domains/${id}`),
};
