import { Request, Response } from 'express';
import { TTSService } from '../services/tts.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const ttsService = new TTSService();

export class TTSController {
    /**
     * Handles TTS requests
     */
    handleSynthesis = asyncHandler(async (req: Request, res: Response) => {
        const { text, language } = req.body;

        if (!text) {
            throw new AppError('Text is required', 400);
        }

        console.log(`[TTS Controller] 📢 Processing synthesis request`);

        const audioBuffer = await ttsService.synthesize(text, language);

        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': `${audioBuffer.length}`
        });

        res.send(audioBuffer);
    });
}
