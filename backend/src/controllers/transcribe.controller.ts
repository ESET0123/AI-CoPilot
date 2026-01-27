import { Request, Response } from 'express';
import { TranscribeService } from '../services/transcribe.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const transcribeService = new TranscribeService();

export class TranscribeController {
    /**
     * Handles transcription requests
     */
    handleTranscription = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            console.log('[Transcribe Controller] ❌ No file uploaded');
            throw new AppError('No file uploaded', 400);
        }

        const method = req.body.method || 'google-webkit';
        const language = req.body.language;

        console.log(`[Transcribe Controller] 🎤 Processing request (Method: ${method})`);

        const result = await transcribeService.transcribe(
            req.file.buffer,
            method,
            language
        );

        res.json(result);
    });
}
