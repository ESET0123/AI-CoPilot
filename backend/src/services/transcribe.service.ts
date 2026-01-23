import { aiServiceClient } from './aiServiceClient';

export class TranscribeService {
    /**
     * Forwards audio to the AI service for transcription.
     * @param audioBuffer The audio file buffer
     * @param method The transcription method (e.g., 'review', 'translate-direct')
     * @param language Optional target language
     */
    async transcribe(
        audioBuffer: Buffer,
        method: string = 'google-webkit',
        language?: string
    ): Promise<{ text: string; originalText: string; language: string }> {
        console.log(`[Transcribe Service] 🎤 Sending to AI service with method: ${method}`);

        const formData = new FormData();
        const blob = new Blob([audioBuffer as unknown as BlobPart], {
            type: 'audio/wav',
        });

        formData.append('file', blob, 'voice.wav');
        formData.append('method', method);

        if (language) {
            formData.append('language', language);
        }

        try {
            const data = await aiServiceClient.post('/api/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.error) {
                throw new Error(data.error);
            }

            return {
                text: data.text,
                originalText: data.original_text || data.text,
                language: data.language || 'en'
            };
        } catch (error) {
            console.error('[Transcribe Service] ❌ API Error:', error);
            throw error;
        }
    }
}
