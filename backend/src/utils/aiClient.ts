import axios from 'axios';

const aiClient = axios.create({
  baseURL: 'http://localhost:8001',
  timeout: 120000,
});

export async function callAIService(
  payload: {
    conversationId: string;
    message: string;
  },
  signal?: AbortSignal
): Promise<string> {
  console.log(`[${new Date().toISOString()}] [AIClient] Sending request to AI service...`);
  const { data } = await aiClient.post(
    '/chat',
    {
      conversation_id: payload.conversationId,
      message: payload.message,
    },
    {
      signal,
    }
  );

  console.log(`[${new Date().toISOString()}] [AIClient] Received response (${data.content.length} chars)`);

  return data.content;
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
    const blob = new Blob([audioData as any], { type: 'audio/wav' });
    formData.append('file', blob as any, 'voice.wav');
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
