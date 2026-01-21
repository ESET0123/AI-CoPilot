import axios from 'axios';
import { env } from '../config/env';

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 120000,
});

export async function callAIService(
  payload: {
    conversationId: string;
    message: string;
  },
  signal?: AbortSignal
): Promise<string> {
  console.log('[AI Client] Requesting /api/classify:', {
    query: payload.message,
  });

  const { data } = await aiClient.post(
    '/api/classify',
    {
      query: payload.message,
    },
    {
      signal,
    }
  );

  console.log('[AI Client] Response Received from /api/classify:', data);

  const responsePayload = {
    text: `Intent: ${data.intent}`,
    type: 'text',
    data: null,
    extras: {}
  };

  return JSON.stringify(responsePayload);
}

export async function stopAIService(conversationId: string) {
  await aiClient.post('/stop', {
    conversation_id: conversationId,
  });
}

export async function transcribeAudio(audioData: Buffer | Blob): Promise<string> {
  const formData = new FormData();
  if (Buffer.isBuffer(audioData)) {
    // In Node.js environment
    const blob = new Blob([audioData as unknown as BlobPart], { type: 'audio/wav' });
    formData.append('file', blob, 'voice.wav');
  } else {
    // In browser environment (if ever used there)
    formData.append('file', audioData, 'voice.wav');
  }

  const { data } = await aiClient.post('/api/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data.error) {
    throw new Error(data.error);
  }

  return data.text;
}
