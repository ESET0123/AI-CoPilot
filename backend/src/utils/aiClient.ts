import axios from 'axios';
import { env } from '../config/env';

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL, // e.g. http://localhost:8002
  timeout: 120000,
});

/**
 * Calls the Intent Classifier Service
 * 
 * Flow:
 * 1. Send query to /api/process
 * 2. Backend classifies intent using LLM
 * 3. Backend routes to appropriate handler
 * 4. Backend returns: query + intent + response from handler
 */
export async function callAIService(
  payload: {
    conversationId: string;
    message: string;
  },
  signal?: AbortSignal
): Promise<string> {
  console.log('[AI Client] Sending request to /api/process');
  console.log('[AI Client] Query:', payload.message);

  const { data } = await aiClient.post(
    '/api/process',
    {
      query: payload.message,
    },
    { signal }
  );

  console.log('[AI Client] Response received:');
  console.log('  - Intent:', data.intent);
  console.log('  - Response length:', data.response.length, 'chars');

  // Build response for chat UI
  const responsePayload = {
    text: data.response,
    type: 'text',
    extras: {
      query: data.query,
      intent: data.intent,
    },
  };

  return JSON.stringify(responsePayload);
}

/**
 * Stop function - can be removed if not needed
 */
export async function stopAIService(conversationId: string) {
  console.log('[AI Client] Stop requested for conversation:', conversationId);
  // No-op for now since we don't have streaming
}

/**
 * Transcription function - can be removed if not needed
 */
export async function transcribeAudio(
  audioData: Buffer | Blob
): Promise<string> {
  const formData = new FormData();
  
  if (Buffer.isBuffer(audioData)) {
    const blob = new Blob([audioData as unknown as BlobPart], {
      type: 'audio/wav',
    });
    formData.append('file', blob, 'voice.wav');
  } else {
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