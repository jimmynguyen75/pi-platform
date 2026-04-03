import { apiClient } from './client';
import type { AuthUser } from '../types';

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data.data ?? res.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiClient.get('/auth/me');
  return res.data.data ?? res.data;
}
