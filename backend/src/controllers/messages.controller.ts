import { Request, Response } from 'express';
import { MessagesService } from '../services/messages.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export class MessagesController {
    static list = asyncHandler(async (req: Request, res: Response) => {
        try {
            const messages = await MessagesService.getMessages(req.params.conversationId, req.userId!);
            res.json(messages);
        } catch (err: any) {
            if (err.message === 'ACCESS_DENIED') {
                throw new AppError('Access denied', 403);
            }
            throw err;
        }
    });

    static send = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { conversationId, message, language } = req.body;
            if (!conversationId || !message?.trim()) {
                throw new AppError('Conversation and message required', 400);
            }

            const result = await MessagesService.sendMessage(conversationId, req.userId!, message, language);
            res.json(result);
        } catch (err: any) {
            if (err.message === 'ABORTED') {
                res.status(204).end();
                return;
            }
            if (err.message === 'ACCESS_DENIED') {
                throw new AppError('Access denied', 403);
            }
            console.error('SEND MESSAGE ERROR:', err);
            throw new AppError('Failed to send message', 500);
        }
    });

    static edit = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { content } = req.body;
            if (!content?.trim()) {
                throw new AppError('Content required', 400);
            }

            const updated = await MessagesService.editMessage(req.params.messageId, req.userId!, content);
            res.json(updated);
        } catch (err: any) {
            switch (err.message) {
                case 'NOT_FOUND':
                    throw new AppError('Message not found', 404);
                case 'ACCESS_DENIED':
                    throw new AppError('Access denied', 403);
                case 'FORBIDDEN':
                    throw new AppError('Only user messages can be edited', 403);
                case 'NOT_LAST':
                    throw new AppError('Only the latest message can be edited', 403);
                default:
                    console.error('EDIT MESSAGE ERROR:', err);
                    throw new AppError('Failed to edit message', 500);
            }
        }
    });

    static stop = asyncHandler(async (req: Request, res: Response) => {
        const { conversation_id } = req.body;
        if (!conversation_id) throw new AppError('conversation_id required', 400);

        try {
            await MessagesService.stopGeneration(conversation_id);
            res.json({ message: 'Stop signal sent' });
        } catch (err) {
            throw new AppError('Failed to signal stop', 500);
        }
    });

    static deleteAfter = asyncHandler(async (req: Request, res: Response) => {
        try {
            const { conversationId, messageId } = req.params;
            if (!conversationId || !messageId) {
                throw new AppError('Conversation ID and Message ID required', 400);
            }

            const deletedCount = await MessagesService.deleteMessagesAfter(
                conversationId,
                req.userId!,
                messageId
            );

            res.json({ deletedCount, message: 'Messages deleted successfully' });
        } catch (err: any) {
            switch (err.message) {
                case 'NOT_FOUND':
                    throw new AppError('Message not found', 404);
                case 'ACCESS_DENIED':
                    throw new AppError('Access denied', 403);
                case 'INVALID_MESSAGE':
                    throw new AppError('Message does not belong to this conversation', 400);
                default:
                    console.error('DELETE MESSAGES AFTER ERROR:', err);
                    throw new AppError('Failed to delete messages', 500);
            }
        }
    });
}
