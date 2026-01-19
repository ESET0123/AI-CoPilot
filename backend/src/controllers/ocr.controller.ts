import { Request, Response } from 'express';
import { OcrService } from '../services/ocr.service';

export class OcrController {
    static async extractText(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const extractedText = await OcrService.extractText(req.file.buffer, req.file.mimetype);

            res.json({
                text: extractedText,
                filename: req.file.originalname,
                mimetype: req.file.mimetype
            });
        } catch (error: any) {
            console.error('OCR Controller Error:', error);
            res.status(500).json({ message: error.message || 'Error processing file' });
        }
    }
}
