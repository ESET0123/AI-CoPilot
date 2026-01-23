import { Router } from 'express';
import multer from 'multer';
import { OcrController } from '../controllers/ocr.controller';
import { requireAuth } from '../middleware/auth';
import { validateFile } from '../middleware/validation';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max for images
});

// POST /api/ocr/extract-text
router.post(
    '/extract-text',
    requireAuth,
    upload.single('file'),
    validateFile({
        required: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    }),
    OcrController.extractText
);

export default router;
