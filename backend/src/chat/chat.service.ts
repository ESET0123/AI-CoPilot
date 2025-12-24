import { pool } from '../db/pool';
import { callAIService } from '../utils/aiClient';

/* ================= TYPES ================= */

export type StoredMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

/* ================= SERVICE ================= */

export class ChatService {
  /* ===== OWNERSHIP CHECK ===== */
  static async assertConversationOwnership(
    conversationId: string,
    userId: string
  ) {
    const result = await pool.query(
      `
      SELECT 1
      FROM conversations
      WHERE id = $1 AND user_id = $2
      `,
      [conversationId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('ACCESS_DENIED');
    }
  }

  /* ===== STORE MESSAGE ===== */
  static async storeMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<StoredMessage> {
    const result = await pool.query(
      `
      INSERT INTO messages (conversation_id, role, content)
      VALUES ($1, $2, $3)
      RETURNING id, role, content
      `,
      [conversationId, role, content]
    );

    return result.rows[0];
  }

  /* ===== FETCH CONTEXT ===== */
  static async fetchRecentMessages(
    conversationId: string,
    limit = 10
  ) {
    const result = await pool.query(
      `
      SELECT role, content
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2
      `,
      [conversationId, limit]
    );

    return result.rows
      .filter(
        r =>
          r.content !==
          'Sorry, I could not generate a response right now.'
      )
      .map(r => ({
        role: r.role,
        content: r.content,
      }));
  }

  /* ===== AI PIPELINE (DECOUPLED) ===== */
  static async generateAndStoreAssistantReply(
    conversationId: string,
    userMessage: string
  ): Promise<StoredMessage> {
    let reply =
      'Sorry, I could not generate a response right now.';

    try {
      // 🔹 Call Python AI Service
      reply = await callAIService({
        conversationId,
        message: userMessage,
      });
    } catch (err) {
      console.error('AI SERVICE ERROR:', err);
    }

    return this.storeMessage(
      conversationId,
      'assistant',
      reply
    );
  }

  /* ===== EDIT MESSAGE ===== */
  static async editLastUserMessage(
    messageId: string,
    userId: string,
    content: string
  ): Promise<StoredMessage> {
    const msgResult = await pool.query(
      `
      SELECT m.id, m.role, m.conversation_id
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = $1 AND c.user_id = $2
      `,
      [messageId, userId]
    );

    if (msgResult.rowCount === 0) {
      throw new Error('NOT_FOUND');
    }

    const msg = msgResult.rows[0];

    if (msg.role !== 'user') {
      throw new Error('FORBIDDEN');
    }

    const lastResult = await pool.query(
      `
      SELECT id
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [msg.conversation_id]
    );

    if (lastResult.rows[0].id !== messageId) {
      throw new Error('NOT_LAST');
    }

    const updated = await pool.query(
      `
      UPDATE messages
      SET content = $1
      WHERE id = $2
      RETURNING id, role, content
      `,
      [content, messageId]
    );

    return updated.rows[0];
  }

  /* ===== STOP GENERATION ===== */
  static async stopGeneration(conversationId: string) {
    try {
      const { stopAIService } = await import('../utils/aiClient');
      await stopAIService(conversationId);
    } catch (err) {
      console.error('FAILED TO STOP AI SERVICE:', err);
    }
  }
}
