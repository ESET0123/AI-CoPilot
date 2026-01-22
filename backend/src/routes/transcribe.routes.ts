import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../utils/aiClient';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            console.log('[Transcribe Route] ❌ No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const method = req.body.method || 'google-webkit';
        const language = req.body.language;
        
        console.log(`[Transcribe Route] 🎤 Received transcription request`);
        console.log(`[Transcribe Route] Method: ${method}, Language: ${language}`);
        console.log(`[Transcribe Route] File: ${req.file.originalname}, Size: ${req.file.size} bytes`);

        const text = await transcribeAudio(req.file.buffer, method, language);
        
        console.log(`[Transcribe Route] ✅ Transcription completed: ${text.length} characters`);
        res.json({ text });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
        console.error('[Transcribe Route] ❌ Error:', errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});

export default router;
