import { Request, Response } from 'express';
import { MessagesService } from '../services/messages.service';

export class MessagesController {
    static async list(req: Request, res: Response) {
        try {
            const messages = await MessagesService.getMessages(req.params.conversationId, req.userId!);
            res.json(messages);
        } catch (err: any) {
            if (err.message === 'ACCESS_DENIED') {
                return res.status(403).json({ message: 'Access denied' });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async send(req: Request, res: Response) {
        try {
            const { conversationId, message } = req.body;
            if (!conversationId || !message?.trim()) {
                return res.status(400).json({ message: 'Conversation and message required' });
            }

            const result = await MessagesService.sendMessage(conversationId, req.userId!, message);
            res.json(result);
        } catch (err: any) {
            if (err.message === 'ABORTED') {
                return res.status(204).end();
            }
            if (err.message === 'ACCESS_DENIED') {
                return res.status(403).json({ message: 'Access denied' });
            }
            console.error('SEND MESSAGE ERROR:', err);
            res.status(500).json({ message: 'Failed to send message' });
        }
    }

    static async edit(req: Request, res: Response) {
        try {
            const { content } = req.body;
            if (!content?.trim()) {
                return res.status(400).json({ message: 'Content required' });
            }

            const updated = await MessagesService.editMessage(req.params.messageId, req.userId!, content);
            res.json(updated);
        } catch (err: any) {
            switch (err.message) {
                case 'NOT_FOUND':
                    return res.status(404).json({ message: 'Message not found' });
                case 'ACCESS_DENIED':
                    return res.status(403).json({ message: 'Access denied' });
                case 'FORBIDDEN':
                    return res.status(403).json({ message: 'Only user messages can be edited' });
                case 'NOT_LAST':
                    return res.status(403).json({ message: 'Only the latest message can be edited' });
                default:
                    console.error('EDIT MESSAGE ERROR:', err);
                    return res.status(500).json({ message: 'Failed to edit message' });
            }
        }
    }

    static async stop(req: Request, res: Response) {
        try {
            const { conversation_id } = req.body;
            if (!conversation_id) return res.status(400).json({ message: 'conversation_id required' });

            await MessagesService.stopGeneration(conversation_id);
            res.json({ message: 'Stop signal sent' });
        } catch (err) {
            res.status(500).json({ message: 'Failed to signal stop' });
        }
    }
}
