import { axiosClient } from './axiosClient';
import type { LoginCredentials } from '../types/types';


export const authApi = {
  login(credentials: LoginCredentials) {
    return axiosClient.post('/api/auth/login', credentials);
  },

  refreshToken() {
    return axiosClient.post('/api/auth/refresh');
  },

  logout() {
    return axiosClient.post('/api/auth/logout');
  },
};


export const chatApi = {
  fetchConversations() {
    return axiosClient.get('/api/conversations');
  },

  fetchMessages(conversationId: string) {
    return axiosClient.get(`/api/messages/${conversationId}`);
  },

  createConversation(title: string) {
    return axiosClient.post('/api/conversations', { title });
  },



  deleteConversation(conversationId: string) {
    return axiosClient.delete(`/api/conversations/${conversationId}`);
  },

  deleteAllConversations() {
    return axiosClient.delete('/api/conversations');
  },

  sendMessage(conversationId: string, message: string, language?: string, signal?: AbortSignal) {
    return axiosClient.post('/api/messages', {
      conversationId,
      message,
      language,
    }, { signal });
  },

  stopMessage(conversationId: string) {
    return axiosClient.post('/api/messages/stop', { conversation_id: conversationId });
  },
};


export const ocrApi = {
  extractText(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/api/ocr/extract-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const transcribeApi = {
  transcribeAudio(blob: Blob, method: string, language?: string) {
    const formData = new FormData();
    formData.append('file', blob, 'voice.wav');
    formData.append('method', method);
    if (language) {
      formData.append('language', language);
    }
    return axiosClient.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const ttsApi = {
  synthesizeText(text: string, language: string = 'en') {
    return axiosClient.post('/api/tts', { text, language }, {
      responseType: 'blob'
    });
  }
};

