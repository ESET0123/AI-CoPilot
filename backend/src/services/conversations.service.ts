import { ConversationsRepository, StoredConversation } from '../repositories/conversations.repository';

export class ConversationsService {
    static async listConversations(userId: string): Promise<StoredConversation[]> {
        return ConversationsRepository.listAllByUserId(userId);
    }

    static async createConversation(userId: string, title?: string): Promise<StoredConversation> {
        return ConversationsRepository.create(userId, title || 'New Chat');
    }


    static async deleteConversation(id: string, userId: string): Promise<void> {
        const deleted = await ConversationsRepository.delete(id, userId);
        if (!deleted) {
            // We don't necessarily need to throw if it's already gone, but we can.
        }
    }

    static async deleteAllConversations(userId: string): Promise<void> {
        await ConversationsRepository.deleteAllByUserId(userId);
    }

    static async assertOwnership(id: string, userId: string): Promise<void> {
        const owns = await ConversationsRepository.checkOwnership(id, userId);
        if (!owns) {
            throw new Error('ACCESS_DENIED');
        }
    }
}
