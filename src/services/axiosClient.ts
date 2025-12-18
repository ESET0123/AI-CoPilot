import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api',
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
