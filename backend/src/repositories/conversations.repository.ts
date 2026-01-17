import { pool } from '../db/pool';

export interface StoredConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: Date;
}

export class ConversationsRepository {
    static async listAllByUserId(userId: string): Promise<StoredConversation[]> {
        try {
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
        } catch (error) {
            console.error('[ConversationsRepository] Failed to list conversations:', error);
            throw new Error('Failed to fetch conversations from database');
        }
    }

    static async create(userId: string, title: string): Promise<StoredConversation> {
        try {
            const result = await pool.query(
                `
                INSERT INTO conversations (user_id, title)
                VALUES ($1, $2)
                RETURNING id, title, created_at
                `,
                [userId, title]
            );
            return result.rows[0];
        } catch (error) {
            console.error('[ConversationsRepository] Failed to create conversation:', error);
            throw new Error('Failed to create conversation in database');
        }
    }

    static async updateTitle(id: string, userId: string, title: string): Promise<StoredConversation | null> {
        try {
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
        } catch (error) {
            console.error('[ConversationsRepository] Failed to update conversation title:', error);
            throw new Error('Failed to update conversation title in database');
        }
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        try {
            const result = await pool.query(
                `
                DELETE FROM conversations
                WHERE id = $1 AND user_id = $2
                `,
                [id, userId]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error('[ConversationsRepository] Failed to delete conversation:', error);
            throw new Error('Failed to delete conversation from database');
        }
    }

    static async deleteAllByUserId(userId: string): Promise<void> {
        try {
            await pool.query(
                `
                DELETE FROM conversations
                WHERE user_id = $1
                `,
                [userId]
            );
        } catch (error) {
            console.error('[ConversationsRepository] Failed to delete all conversations:', error);
            throw new Error('Failed to delete conversations from database');
        }
    }

    static async checkOwnership(id: string, userId: string): Promise<boolean> {
        try {
            const result = await pool.query(
                `
                SELECT 1
                FROM conversations
                WHERE id = $1 AND user_id = $2
                `,
                [id, userId]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error('[ConversationsRepository] Failed to check conversation ownership:', error);
            throw new Error('Failed to verify conversation ownership');
        }
    }
}
