import { create } from 'zustand';
import type { AuthUser } from '../types';

interface AppState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

// AuthUser role is 'admin' | 'manager' — no staff
export const useAppStore = create<AppState>((set) => ({
  user: (() => {
    try {
      const raw = localStorage.getItem('pi_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('pi_token'),

  setAuth: (user, token) => {
    localStorage.setItem('pi_token', token);
    localStorage.setItem('pi_user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
    set({ user: null, token: null });
  },

  globalSearch: '',
  setGlobalSearch: (q) => set({ globalSearch: q }),
}));
