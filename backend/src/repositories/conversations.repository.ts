import { pool } from '../db/pool';

export interface StoredConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: Date;
}

export class ConversationsRepository {
    static async listAllByUserId(userId: string): Promise<StoredConversation[]> {
        const result = await pool.query(
            `
      SELECT id, title, created_at
      FROM conversations
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
            [userId]
        );
        return result.rows;
    }

    static async create(userId: string, title: string): Promise<StoredConversation> {
        const result = await pool.query(
            `
      INSERT INTO conversations (user_id, title)
      VALUES ($1, $2)
      RETURNING id, title, created_at
      `,
            [userId, title]
        );
        return result.rows[0];
    }

    static async updateTitle(id: string, userId: string, title: string): Promise<StoredConversation | null> {
        const result = await pool.query(
            `
      UPDATE conversations
      SET title = $1
      WHERE id = $2 AND user_id = $3
      RETURNING id, title, created_at
      `,
            [title, id, userId]
        );
        return result.rows[0] || null;
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `
      DELETE FROM conversations
      WHERE id = $1 AND user_id = $2
      `,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async deleteAllByUserId(userId: string): Promise<void> {
        await pool.query(
            `
      DELETE FROM conversations
      WHERE user_id = $1
      `,
            [userId]
        );
    }

    static async checkOwnership(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `
      SELECT 1
      FROM conversations
      WHERE id = $1 AND user_id = $2
      `,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
