import { Request, Response } from 'express';
import { ConversationsService } from '../services/conversations.service';

export class ConversationsController {
    static async list(req: Request, res: Response) {
        try {
            const conversations = await ConversationsService.listConversations(req.userId!);
            res.json(conversations);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { title } = req.body;
            console.log('[ConversationsController] Creating conversation for userId:', req.userId);
            const conversation = await ConversationsService.createConversation(req.userId!, title);
            res.status(201).json(conversation);
        } catch (err: any) {
            console.error('[ConversationsController] Create error details:', err.message, err.stack);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    }

    static async rename(req: Request, res: Response) {
        try {
            const { title } = req.body;
            if (!title?.trim()) {
                return res.status(400).json({ message: 'Title required' });
            }
            const updated = await ConversationsService.renameConversation(req.params.id, req.userId!, title);
            res.json(updated);
        } catch (err: any) {
            if (err.message === 'NOT_FOUND') {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await ConversationsService.deleteConversation(req.params.id, req.userId!);
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    static async deleteAll(req: Request, res: Response) {
        try {
            await ConversationsService.deleteAllConversations(req.userId!);
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
