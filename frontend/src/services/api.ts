import { axiosClient } from './axiosClient';

/* ================= AUTH ================= */

export const authApi = {
  // Keycloak OAuth2 endpoints
  keycloakCallback(code: string, redirectUri: string) {
    return axiosClient.get('/auth/callback', {
      params: { code, redirect_uri: redirectUri },
    });
  },

  login(credentials: any) {
    return axiosClient.post('/auth/login', credentials);
  },

  refreshToken(refreshToken: string) {
    return axiosClient.post('/auth/refresh', { refresh_token: refreshToken });
  },

  logout(refreshToken: string) {
    return axiosClient.post('/auth/logout', { refresh_token: refreshToken });
  },

  // Legacy OTP endpoints (deprecated)
  sendOtp(email: string) {
    return axiosClient.post('/auth/send-otp', {
      email: email.toLowerCase().trim(),
    });
  },

  verifyOtp(payload: { email: string; otp: string }) {
    return axiosClient.post('/auth/verify-otp', {
      email: payload.email.toLowerCase().trim(),
      otp: payload.otp.trim(),
    });
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

  renameConversation(conversationId: string, title: string) {
    return axiosClient.patch(`/conversations/${conversationId}`, { title });
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

