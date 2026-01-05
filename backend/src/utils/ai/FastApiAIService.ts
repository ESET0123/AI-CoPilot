import axios, { AxiosInstance } from 'axios';
import { IAIService, AIChatPayload } from './IAIService';

export class FastApiAIService implements IAIService {
    private client: AxiosInstance;

    constructor(baseURL: string = 'http://localhost:8001') {
        this.client = axios.create({
            baseURL,
            timeout: 120000,
        });
    }

    async callChat(payload: AIChatPayload, signal?: AbortSignal): Promise<string> {
        console.log(`[${new Date().toISOString()}] [FastApiAIService] Sending request...`);
        const { data } = await this.client.post(
            '/chat',
            {
                conversation_id: payload.conversationId,
                message: payload.message,
            },
            { signal }
        );
        console.log(`[${new Date().toISOString()}] [FastApiAIService] Received response`);
        return data.content;
    }

    async stopChat(conversationId: string): Promise<void> {
        await this.client.post('/stop', {
            conversation_id: conversationId,
        });
    }

    async transcribeAudio(audioData: Buffer | Blob): Promise<string> {
        const formData = new FormData();
        if (Buffer.isBuffer(audioData)) {
            const blob = new Blob([audioData as any], { type: 'audio/wav' });
            formData.append('file', blob as any, 'voice.wav');
        } else {
            formData.append('file', audioData, 'voice.wav');
        }

        const { data } = await this.client.post('/api/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (data.error) {
            throw new Error(data.error);
        }

        return data.text;
    }
}
