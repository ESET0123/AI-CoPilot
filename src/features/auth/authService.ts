import { axiosClient } from '../../services/axiosClient';

export const loginApi = (email: string, password: string) =>
  axiosClient.post('/login', { email, password });

export const registerApi = (name: string, email: string, password: string) =>
  axiosClient.post('/register', {name, email, password,});
