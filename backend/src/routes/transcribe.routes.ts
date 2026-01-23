import { Router } from 'express';
import multer from 'multer';
import { TranscribeController } from '../controllers/transcribe.controller';
import { validateFile } from '../middleware/validation';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});
const transcribeController = new TranscribeController();

router.post(
    '/',
    upload.single('file'),
    validateFile({
        required: true,
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg']
    }),
    (req, res) => transcribeController.handleTranscription(req, res)
);

export default router;
