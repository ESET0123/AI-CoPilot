import { Request, Response } from 'express';
import { OcrService } from '../services/ocr.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export class OcrController {
    static extractText = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const extractedText = await OcrService.extractText(req.file.buffer, req.file.mimetype);

        res.json({
            text: extractedText,
            filename: req.file.originalname,
            mimetype: req.file.mimetype
        });
    });
}
