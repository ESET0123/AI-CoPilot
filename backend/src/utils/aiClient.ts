import { aiServiceClient } from '../services/aiServiceClient';
import { env } from '../config/env';

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
    role?: string;
  },
  signal?: AbortSignal
): Promise<string> {
  console.log('[AI Client] Sending request to /api/process');
  console.log('[AI Client] Query:', payload.message, '(Lang:', payload.language || 'en', ')');

  const data = await aiServiceClient.post<any>(
    '/api/process',
    {
      query: payload.message,
      language: payload.language || 'en',
      role: payload.role
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
 * Stop function - kept as stub as it is used in MessagesService
 */
export async function stopAIService(conversationId: string) {
  console.log('[AI Client] Stop requested for conversation:', conversationId);
  // No-op for now since we don't have streaming
}