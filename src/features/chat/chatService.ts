import { axiosClient } from '../../services/axiosClient';

export const sendMessageApi = (message: string) =>
  axiosClient.post('/chat', { message });
