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
    language?: string;
  },
  signal?: AbortSignal
): Promise<string> {
  console.log('[AI Client] Sending request to /api/process');
  console.log('[AI Client] Query:', payload.message, '(Lang:', payload.language || 'en', ')');

  const { data } = await aiClient.post(
    '/api/process',
    {
      query: payload.message,
      language: payload.language || 'en'
    },
    { signal }
  );

  console.log('[AI Client] Response received:');
  console.log('  - Intent:', data.intent);
  console.log('  - Language:', data.language);

  // If there is a translated response (e.g. Hindi), use it as the primary text for chat
  const finalResponseText = data.translated_response || data.response;

  // Build response for chat UI
  const responsePayload = {
    text: finalResponseText,
    type: 'text',
    extras: {
      query: data.query,
      intent: data.intent,
      language: data.language,
      englishResponse: data.response // Keep English for reference or debugging
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
  audioData: Buffer | Blob,
  method: string = 'google-webkit',
  language?: string
): Promise<string> {
  console.log(`[AI Client] 🎤 Transcribing audio with method: ${method}`);

  const formData = new FormData();

  if (Buffer.isBuffer(audioData)) {
    const blob = new Blob([audioData as unknown as BlobPart], {
      type: 'audio/wav',
    });
    formData.append('file', blob, 'voice.wav');
  } else {
    formData.append('file', audioData, 'voice.wav');
  }

  formData.append('method', method);
  if (language) {
    formData.append('language', language);
  }

  console.log(`[AI Client] 📡 Sending to LLM-service: ${env.AI_SERVICE_URL}/api/transcribe`);

  const { data } = await aiClient.post('/api/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (data.error) {
    console.error(`[AI Client] ❌ Transcription error: ${data.error}`);
    throw new Error(data.error);
  }

  console.log(`[AI Client] ✅ Transcription successful: ${data.text.length} characters`);
  return data.text;
}