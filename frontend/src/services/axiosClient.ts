import axios from 'axios';
import { store } from '../app/store';
import { logout, refreshAccessToken } from '../features/auth/authSlice';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const url = config.url || '';
  // Don't add auth header to auth endpoints
  if (url.includes('/auth/')) {
    return config;
  }

  const storedAuth = localStorage.getItem('auth');

  if (storedAuth) {
    try {
      const auth = JSON.parse(storedAuth);
      const token = auth.token || auth.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('[AxiosClient] Failed to parse auth from localStorage', e);
    }
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

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the failed request was already an auth request, don't retry (prevents infinite loops)
      if (originalRequest.url?.startsWith('/auth')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[AxiosClient] Token expired, attempting refresh...');
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        const newToken = result.access_token;

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('[AxiosClient] Token refresh failed, logging out...');
        processQueue(refreshError, null);
        localStorage.removeItem('auth');
        store.dispatch(logout());
        // Use a more gentle way to redirect if possible, but window.location is definitive
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
