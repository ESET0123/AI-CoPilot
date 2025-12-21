import { axiosClient } from './axiosClient';

/* ================= AUTH ================= */

export const authApi = {
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

  sendMessage(conversationId: string, message: string) {
    return axiosClient.post('/messages', {
      conversationId,
      message,
    });
  },
};

