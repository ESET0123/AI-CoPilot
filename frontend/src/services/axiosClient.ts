import axios from 'axios';
import { store } from '../app/store';
import { logout, refreshAccessToken } from '../features/auth/authSlice';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  return config;
});

interface QueuedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/me')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await store.dispatch(refreshAccessToken()).unwrap();

        // Process queued requests after successful refresh
        try {
          processQueue(null);
        } catch (queueError) {
          console.error('[AxiosClient] Error processing failed queue:', queueError);
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        try {
          processQueue(error);
        } catch (queueError) {
          console.error('[AxiosClient] Error processing failed queue:', queueError);
        }

        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        // Always reset the refreshing flag
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
