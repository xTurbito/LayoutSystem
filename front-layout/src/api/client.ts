import axios from 'axios';
import { toast } from 'sonner';

export const USER_KEY = 'auth_user';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({ baseURL: BASE_URL, withCredentials: true });

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

function clearSession() {
  inMemoryToken = null;
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
}

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processPendingQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      toast.error('No se puede conectar al servidor. Intenta más tarde.', { id: 'network-error' });
      return Promise.reject(error);
    }

    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    const isRefreshEndpoint = error.config?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !isLoginEndpoint && !isRefreshEndpoint) {
      const originalRequest = error.config;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );

        inMemoryToken = data.token;
        processPendingQueue(null, data.token);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processPendingQueue(refreshError, null);
        isRefreshing = false;
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
