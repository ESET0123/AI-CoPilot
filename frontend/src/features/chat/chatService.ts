import { axiosClient } from '../../services/axiosClient';

/* ================= CONVERSATIONS ================= */

export const fetchConversationsApi = () =>
  axiosClient.get('/conversations');

export const createConversationApi = (title: string) =>
  axiosClient.post('/conversations', { title });

export const renameConversationApi = (
  conversationId: string,
  title: string
) =>
  axiosClient.patch(`/conversations/${conversationId}`, { title });

export const deleteConversationApi = (conversationId: string) =>
  axiosClient.delete(`/conversations/${conversationId}`);

/* ================= MESSAGES ================= */

export const fetchMessagesApi = (conversationId: string) =>
  axiosClient.get(`/messages/${conversationId}`);

export const sendMessageApi = (
  conversationId: string,
  message: string
) =>
  axiosClient.post('/messages', {
    conversationId,
    message,
  });


// import { axiosClient } from '../../services/axiosClient';

// /* ================= CONVERSATIONS ================= */

// export const fetchConversationsApi = () =>
//   axiosClient.get('/conversations');

// export const createConversationApi = (title: string) =>
//   axiosClient.post('/conversations', { title });

// export const renameConversationApi = (id: string, title: string) =>
//   axiosClient.patch(`/conversations/${id}`, { title });

// /* ================= MESSAGES ================= */

// export const fetchMessagesApi = (conversationId: string) =>
//   axiosClient.get(`/messages/${conversationId}`);

// export const sendMessageApi = (
//   conversationId: string,
//   message: string
// ) =>
//   axiosClient.post('/messages', {
//     conversationId,
//     message,
//   });
