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
  console.log('[AI Client] Requesting /api/chat:', {
    conversation_id: payload.conversationId,
    message: payload.message,
  });

  const { data } = await aiClient.post(
    '/api/chat',
    {
      message: payload.message,
      model_type: 'local',
      user_role: 'admin', // Default role for now
    },
    {
      signal,
    }
  );

  console.log('[AI Client] Response Received from /api/chat');

  // Map the structured ChatResponse to the JSON format expected by the frontend
  // This format mimics what modules/compatibility_layer.py used to do
  const responsePayload: any = {
    text: data.content,
    type: data.type === 'data' ? (data.sql ? 'sql' : (data.data?.rows?.length > 0 ? 'table' : 'text')) : data.type,
    data: data.data?.rows || null,
    extras: {
      sql: data.sql,
      insight: data.insight,
      plot_json: data.plot_json,
    },
  };

  // If visualization type is specified in insight, use it
  if (data.insight?.visualization_type) {
    responsePayload.type = 'chart';
    responsePayload.extras.chartType = data.insight.visualization_type;
    responsePayload.extras.xKey = data.insight.x_column || 'ts';
    responsePayload.extras.yKey = data.insight.y_column || 'value';
    responsePayload.extras.yLabel = (data.insight.y_column || 'Value').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  }

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
