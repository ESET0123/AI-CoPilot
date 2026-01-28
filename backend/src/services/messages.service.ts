import { MessagesRepository, StoredMessage } from '../repositories/messages.repository';
import { ConversationsService } from './conversations.service';
import { callAIService, stopAIService } from '../utils/aiClient';

const activeGenerations = new Map<string, AbortController>();

export class MessagesService {
    static async getMessages(conversationId: string, userId: string): Promise<StoredMessage[]> {
        // Ensure ownership before fetching
        await ConversationsService.assertOwnership(conversationId, userId);
        return MessagesRepository.listByConversationId(conversationId);
    }

    static async sendMessage(conversationId: string, userId: string, content: string, language?: string): Promise<{ user: StoredMessage; assistant: StoredMessage }> {
        // 1. Assert Ownership
        await ConversationsService.assertOwnership(conversationId, userId);

        // 2. Store User Message
        const userMsg = await MessagesRepository.create(conversationId, 'user', content.trim());

        // 3. Generate Assistant Reply
        const controller = new AbortController();
        activeGenerations.set(conversationId, controller);

        try {
            const replyContent = await callAIService(
                { conversationId, message: content.trim(), language },
                controller.signal
            );

            const assistantMsg = await MessagesRepository.create(conversationId, 'assistant', replyContent);
            return { user: userMsg, assistant: assistantMsg };
        } catch (err: any) {
            if (controller.signal.aborted) {
                throw new Error('ABORTED');
            }
            throw err;
        } finally {
            activeGenerations.delete(conversationId);
        }
    }

    static async stopGeneration(conversationId: string): Promise<void> {
        const controller = activeGenerations.get(conversationId);
        if (controller) {
            controller.abort();
            activeGenerations.delete(conversationId);
        }

        try {
            await stopAIService(conversationId);
        } catch (err) {
            console.error('FAILED TO STOP AI SERVICE:', err);
        }
    }

    static async editMessage(messageId: string, userId: string, content: string): Promise<StoredMessage> {
        const msg = await MessagesRepository.findById(messageId);
        if (!msg) throw new Error('NOT_FOUND');

        // Ownership check via conversation
        await ConversationsService.assertOwnership(msg.conversation_id, userId);

        if (msg.role !== 'user') throw new Error('FORBIDDEN');

        const latest = await MessagesRepository.findLatestByConversationId(msg.conversation_id);
        if (latest?.id !== messageId) throw new Error('NOT_LAST');

        const updated = await MessagesRepository.updateContent(messageId, content.trim());
        if (!updated) throw new Error('NOT_FOUND');

        return updated;
    }

    static async deleteMessagesAfter(conversationId: string, userId: string, messageId: string): Promise<number> {
        // 1. Assert Ownership
        await ConversationsService.assertOwnership(conversationId, userId);

        // 2. Find the target message
        const targetMessage = await MessagesRepository.findById(messageId);
        if (!targetMessage) throw new Error('NOT_FOUND');

        // 3. Verify the message belongs to this conversation
        if (targetMessage.conversation_id !== conversationId) throw new Error('INVALID_MESSAGE');

        // 4. Delete all messages from this timestamp onwards
        const deletedCount = await MessagesRepository.deleteMessagesFromTimestamp(
            conversationId,
            targetMessage.created_at
        );

        return deletedCount;
    }
}
