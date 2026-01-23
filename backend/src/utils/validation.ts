import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 */

export const transcribeSchema = z.object({
    method: z.enum(['google-webkit', 'review', 'translate-direct']).default('google-webkit'),
    language: z.string().optional(),
});

export const ttsSchema = z.object({
    text: z.string().min(1, 'Text is required').max(5000, 'Text too long (max 5000 characters)'),
    language: z.string().regex(/^[a-z]{2}$/, 'Invalid language code').default('en'),
});

export const ocrSchema = z.object({
    // File validation happens in multer middleware
});

export const messageSchema = z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
    message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
    language: z.string().regex(/^[a-z]{2}$/, 'Invalid language code').optional(),
});

export type TranscribeInput = z.infer<typeof transcribeSchema>;
export type TTSInput = z.infer<typeof ttsSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
