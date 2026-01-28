import { speechServiceClient } from './speechServiceClient';

export class TTSService {
    /**
     * Forwards text to the AI service for speech synthesis.
     * @param text The text to convert to speech
     * @param language The language of the text
     */
    async synthesize(text: string, language: string = 'en'): Promise<Buffer> {
        console.log(`[TTS Service] 📢 Requesting synthesis for text (Lang: ${language})`);

        const response = await speechServiceClient.getClient().post('/api/tts', {
            text,
            language
        }, {
            responseType: 'arraybuffer'
        });

        return Buffer.from(response.data);
    }
}
