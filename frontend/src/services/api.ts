import { axiosClient } from './axiosClient';
import type { LoginCredentials } from '../types/types';

/* ================= AUTH ================= */

export const authApi = {
  login(credentials: LoginCredentials) {
    return axiosClient.post('/auth/login', credentials);
  },

  refreshToken() {
    return axiosClient.post('/auth/refresh');
  },

  logout() {
    return axiosClient.post('/auth/logout');
  },
};

/* ================= CHAT ================= */

export const chatApi = {
  fetchConversations() {
    return axiosClient.get('/conversations');
  },

  fetchMessages(conversationId: string) {
    return axiosClient.get(`/messages/${conversationId}`);
  },

  createConversation(title: string) {
    return axiosClient.post('/conversations', { title });
  },



  deleteConversation(conversationId: string) {
    return axiosClient.delete(`/conversations/${conversationId}`);
  },

  editMessage(messageId: string, content: string) {
    return axiosClient.patch(`/messages/${messageId}`, { content });
  },

  deleteAllConversations() {
    return axiosClient.delete('/conversations');
  },

  sendMessage(conversationId: string, message: string, signal?: AbortSignal) {
    return axiosClient.post('/messages', {
      conversationId,
      message,
    }, { signal });
  },

  stopMessage(conversationId: string) {
    return axiosClient.post('/stop', { conversation_id: conversationId });
  },
};

