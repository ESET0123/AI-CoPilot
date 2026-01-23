import { Request, Response } from 'express';
import { TranscribeService } from '../services/transcribe.service';

const transcribeService = new TranscribeService();

export class TranscribeController {
    /**
     * Handles transcription requests
     */
    async handleTranscription(req: Request, res: Response) {
        try {
            if (!req.file) {
                console.log('[Transcribe Controller] ❌ No file uploaded');
                return res.status(400).json({ error: 'No file uploaded' });
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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
            console.error('[Transcribe Controller] ❌ Error:', errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }
}
