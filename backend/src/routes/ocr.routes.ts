import { Router } from 'express';
import multer from 'multer';
import { OcrController } from '../controllers/ocr.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ocr/extract-text
router.post('/extract-text', requireAuth, upload.single('file'), OcrController.extractText);

export default router;
