import { axiosClient } from '../../services/axiosClient';

export const loginApi = (email: string, password: string) =>
  axiosClient.post('/auth/login', { email, password });

export const registerApi = (
  name: string,
  email: string,
  password: string
) =>
  axiosClient.post(
    '/auth/register',
    { name, email, password },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

