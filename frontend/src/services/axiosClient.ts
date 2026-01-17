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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
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
      if (originalRequest.url?.startsWith('/auth')) {
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
        if (import.meta.env.MODE !== 'production') {
          console.log('[AxiosClient] Token expired, attempting refresh...');
        }
        await store.dispatch(refreshAccessToken()).unwrap();

        // Process queued requests after successful refresh
        try {
          processQueue(null);
        } catch (queueError) {
          console.error('[AxiosClient] Error processing failed queue:', queueError);
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error('[AxiosClient] Token refresh failed, logging out...');

        // Process queued requests with error
        try {
          processQueue(refreshError);
        } catch (queueError) {
          console.error('[AxiosClient] Error processing failed queue:', queueError);
        }

        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth'); // Clear legacy key too
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        // Always reset the refreshing flag
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
