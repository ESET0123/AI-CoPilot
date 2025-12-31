import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../utils/aiClient';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert Buffer to Blob-like if needed or just use buffer
        // Actually, transcribeAudio expects a Blob (which works in Browser)
        // In Node, we can pass the buffer or create a Blob if needed.
        // aiClient uses Axios which can take a buffer directly for multipart if handled correctly.

        // Let's modify transcribeAudio in aiClient to handle Buffer/Readable stream if needed,
        // but for simplicity, let's see if we can just pass the buffer.

        const text = await transcribeAudio(req.file.buffer as any);
        res.json({ text });
    } catch (error: any) {
        console.error('Transcription route error:', error);
        res.status(500).json({ error: error.message || 'Transcription failed' });
    }
});

export default router;
