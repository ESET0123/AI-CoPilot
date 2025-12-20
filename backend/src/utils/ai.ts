import axios from 'axios';
import { env } from '../config/env';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    Authorization: `Bearer ${env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export async function generateAIReply(
  messages: ChatMessage[]
): Promise<string> {
  if (!messages.length || messages[0].role !== 'system') {
    throw new Error('Groq requires messages to start with system role');
  }

  const response = await groqClient.post('/chat/completions', {
    model: 'llama-3.1-8b-instant',
    messages,
    temperature: 0.7,
    max_tokens: 512,
  });

  const reply = response.data?.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error('Empty response from Groq');
  }

  return reply.trim();
}
