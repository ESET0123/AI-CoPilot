import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem('auth');

  if (storedAuth) {
    const { token } = JSON.parse(storedAuth);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      //  FORCE LOGOUT ON INVALID TOKEN
      localStorage.removeItem('auth');
      store.dispatch(logout());
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
