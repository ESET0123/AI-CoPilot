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
    }

    static async create(conversationId: string, role: 'user' | 'assistant', content: string): Promise<StoredMessage> {
        const result = await pool.query(
            `
      INSERT INTO messages (conversation_id, role, content)
      VALUES ($1, $2, $3)
      RETURNING id, role, content, created_at
      `,
            [conversationId, role, content]
        );
        return result.rows[0];
    }

    static async findById(messageId: string): Promise<StoredMessage | null> {
        const result = await pool.query(
            `
      SELECT id, role, conversation_id, content, created_at
      FROM messages
      WHERE id = $1
      `,
            [messageId]
        );
        return result.rows[0] || null;
    }

    static async findLatestByConversationId(conversationId: string): Promise<StoredMessage | null> {
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
    }

    static async updateContent(messageId: string, content: string): Promise<StoredMessage | null> {
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
    }
}
