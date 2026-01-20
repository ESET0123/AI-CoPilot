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
            const conversation = await ConversationsService.createConversation(req.userId!, title);
            res.status(201).json(conversation);
        } catch (err: any) {
            console.error('[ConversationsController] Create error details:', err.message, err.stack);
            const message = process.env.NODE_ENV === 'production'
                ? 'Internal Server Error'
                : err.message;
            res.status(500).json({ message });
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
