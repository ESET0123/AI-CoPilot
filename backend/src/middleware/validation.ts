import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware factory for validating request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error: any) {
            res.status(400).json({
                message: 'Validation error',
                errors: error.errors?.map((e: any) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })) || [{ message: error.message }],
            });
        }
    };
};

/**
 * Middleware for validating file uploads
 */
export const validateFile = (options: {
    required?: boolean;
    maxSize?: number; // in bytes
    allowedMimeTypes?: string[];
}) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;

        if (options.required && !file) {
            return res.status(400).json({
                message: 'File is required',
            });
        }

        if (file) {
            // Check file size
            if (options.maxSize && file.size > options.maxSize) {
                return res.status(400).json({
                    message: `File too large. Maximum size is ${options.maxSize / 1024 / 1024}MB`,
                });
            }

            // Check MIME type
            if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    message: `Invalid file type. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
                });
            }
        }

        next();
    };
};
