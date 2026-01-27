import { Request, Response } from 'express';
import { ConversationsService } from '../services/conversations.service';
import { asyncHandler } from '../utils/asyncHandler';

export class ConversationsController {
    static list = asyncHandler(async (req: Request, res: Response) => {
        const conversations = await ConversationsService.listConversations(req.userId!);
        res.json(conversations);
    });

    static create = asyncHandler(async (req: Request, res: Response) => {
        const { title } = req.body;
        const conversation = await ConversationsService.createConversation(req.userId!, title);
        res.status(201).json(conversation);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        await ConversationsService.deleteConversation(req.params.id, req.userId!);
        res.sendStatus(204);
    });

    static deleteAll = asyncHandler(async (req: Request, res: Response) => {
        await ConversationsService.deleteAllConversations(req.userId!);
        res.sendStatus(204);
    });
}
