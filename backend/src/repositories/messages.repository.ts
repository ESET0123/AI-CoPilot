import { pool } from '../db/pool';

export interface StoredMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: Date;
}

export class MessagesRepository {
    static async listByConversationId(conversationId: string, limit: number = 50): Promise<StoredMessage[]> {
        try {
            const result = await pool.query(
                `
                SELECT id, role, content, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at ASC
                LIMIT $2
                `,
                [conversationId, limit]
            );
            return result.rows;
        } catch (error) {
            console.error('[MessagesRepository] Failed to list messages:', error);
            throw new Error('Failed to fetch messages from database');
        }
    }

    static async create(conversationId: string, role: 'user' | 'assistant', content: string): Promise<StoredMessage> {
        try {
            const result = await pool.query(
                `
                INSERT INTO messages (conversation_id, role, content)
                VALUES ($1, $2, $3)
                RETURNING id, role, content, created_at
                `,
                [conversationId, role, content]
            );
            return result.rows[0];
        } catch (error) {
            console.error('[MessagesRepository] Failed to create message:', error);
            throw new Error('Failed to create message in database');
        }
    }

    static async findById(messageId: string): Promise<StoredMessage | null> {
        try {
            const result = await pool.query(
                `
                SELECT id, role, conversation_id, content, created_at
                FROM messages
                WHERE id = $1
                `,
                [messageId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[MessagesRepository] Failed to find message by ID:', error);
            throw new Error('Failed to find message in database');
        }
    }

    static async findLatestByConversationId(conversationId: string): Promise<StoredMessage | null> {
        try {
            const result = await pool.query(
                `
                SELECT id, role, content, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT 1
                `,
                [conversationId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[MessagesRepository] Failed to find latest message:', error);
            throw new Error('Failed to find latest message in database');
        }
    }

    static async updateContent(messageId: string, content: string): Promise<StoredMessage | null> {
        try {
            const result = await pool.query(
                `
                UPDATE messages
                SET content = $1
                WHERE id = $2
                RETURNING id, role, content, created_at
                `,
                [content, messageId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('[MessagesRepository] Failed to update message content:', error);
            throw new Error('Failed to update message in database');
        }
    }

    static async deleteMessagesFromTimestamp(conversationId: string, timestamp: Date): Promise<number> {
        try {
            const result = await pool.query(
                `
                DELETE FROM messages
                WHERE conversation_id = $1
                AND created_at >= $2
                RETURNING id
                `,
                [conversationId, timestamp]
            );
            return result.rowCount || 0;
        } catch (error) {
            console.error('[MessagesRepository] Failed to delete messages from timestamp:', error);
            throw new Error('Failed to delete messages from database');
        }
    }
}
