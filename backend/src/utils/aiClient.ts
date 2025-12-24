import axios from 'axios';

const aiClient = axios.create({
  baseURL: 'http://localhost:8001', // Python AI Service
  timeout: 120000,
});

export async function callAIService(payload: {
  conversationId: string;
  message: string;
}): Promise<string> {
  const { data } = await aiClient.post('/chat', {
    conversation_id: payload.conversationId, // ✅ FIX
    message: payload.message,
  });

  return data.content;
}
export async function stopAIService(conversationId: string): Promise<void> {
  await aiClient.post('/stop', {
    conversation_id: conversationId,
  });
}
