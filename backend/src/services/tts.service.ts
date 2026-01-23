import { aiServiceClient } from './aiServiceClient';

export class TTSService {
    /**
     * Forwards text to the AI service for speech synthesis.
     * @param text The text to convert to speech
     * @param language The language of the text
     */
    async synthesize(text: string, language: string = 'en'): Promise<Buffer> {
        console.log(`[TTS Service] 📢 Requesting synthesis for text (Lang: ${language})`);

        try {
            const data = await aiServiceClient.getClient().post('/api/tts', {
                text,
                language
            }, {
                responseType: 'arraybuffer'
            });

            return Buffer.from(data.data);
        } catch (error) {
            console.error('[TTS Service] ❌ AI Service Error:', error);
            throw error;
        }
    }
}
