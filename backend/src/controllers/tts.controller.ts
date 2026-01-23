import { Request, Response } from 'express';
import { TTSService } from '../services/tts.service';

const ttsService = new TTSService();

export class TTSController {
    /**
     * Handles TTS requests
     */
    async handleSynthesis(req: Request, res: Response) {
        try {
            const { text, language } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            console.log(`[TTS Controller] 📢 Processing synthesis request`);

            const audioBuffer = await ttsService.synthesize(text, language);

            res.set({
                'Content-Type': 'audio/wav',
                'Content-Length': audioBuffer.length
            });

            res.send(audioBuffer);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Synthesis failed';
            console.error('[TTS Controller] ❌ Error:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }
}
