import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:5000',
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
