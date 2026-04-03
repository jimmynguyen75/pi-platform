import { get, post, patch, del } from './client';
import type { Manager } from '../types';

export const employeesApi = {
  getAll: (search?: string) =>
    get<Manager[]>('/employees', search ? { search } : undefined),

  getOne: (id: string) => get<Manager>(`/employees/${id}`),

  create: (data: Partial<Manager> & { password: string }) =>
    post<Manager>('/employees', data),

  update: (id: string, data: Partial<Manager>) =>
    patch<Manager>(`/employees/${id}`, data),

  remove: (id: string) => del(`/employees/${id}`),
};
