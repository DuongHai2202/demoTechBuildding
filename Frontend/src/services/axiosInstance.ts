import axios from 'axios';

import { useAuthStore } from '../features/auth/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: auto refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        const refreshToken = useAuthStore.getState().refreshToken;
        axios
          .post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
          .then(({ data }) => {
            const { setTokens } = useAuthStore.getState();
            setTokens(data.data.accessToken, data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            processQueue(null, data.data.accessToken);
            resolve(api(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            useAuthStore.getState().logout();
            window.location.href = '/login';
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);
