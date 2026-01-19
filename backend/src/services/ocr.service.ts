import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';

export class OcrService {
    /**
     * Extracts text from an image buffer using Tesseract.js
     */
    static async extractTextFromImage(buffer: Buffer): Promise<string> {
        try {
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
            return text;
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    /**
     * Extracts text from a PDF buffer using pdf-parse
     */
    static async extractTextFromPdf(buffer: Buffer): Promise<string> {
        try {
            const data = await (pdf as any)(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF Parse Error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Detects file type from mimetype and extracts text accordingly
     */
    static async extractText(buffer: Buffer, mimetype: string): Promise<string> {
        if (mimetype.startsWith('image/')) {
            return this.extractTextFromImage(buffer);
        } else if (mimetype === 'application/pdf') {
            return this.extractTextFromPdf(buffer);
        } else if (mimetype === 'text/plain') {
            return buffer.toString('utf-8');
        } else {
            throw new Error('Unsupported file type');
        }
    }
}
