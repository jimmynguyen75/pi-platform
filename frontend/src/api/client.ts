import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pi_token');
      localStorage.removeItem('pi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Unwrap the ApiResponse wrapper
export async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
  const res = await apiClient.get(url, { params });
  return res.data.data ?? res.data;
}

export async function post<T>(url: string, body?: any): Promise<T> {
  const res = await apiClient.post(url, body);
  return res.data.data ?? res.data;
}

export async function patch<T>(url: string, body?: any): Promise<T> {
  const res = await apiClient.patch(url, body);
  return res.data.data ?? res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await apiClient.delete(url);
  return res.data.data ?? res.data;
}
