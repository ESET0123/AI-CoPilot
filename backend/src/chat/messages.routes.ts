import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

/* GET messages */
router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const userId = (req as any).userId;

  const result = await pool.query(
    `
    SELECT m.role, m.content, m.created_at
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.conversation_id = $1
      AND c.user_id = $2
    ORDER BY m.created_at
    `,
    [conversationId, userId]
  );

  res.json(result.rows);
});

/* SEND message */
router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = (req as any).userId;

  const ownsConversation = await pool.query(
    `
    SELECT 1 FROM conversations
    WHERE id = $1 AND user_id = $2
    `,
    [conversationId, userId]
  );

  if (ownsConversation.rowCount === 0) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await pool.query(
    `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, 'user', $2)
    `,
    [conversationId, message]
  );

  const reply = `You said: ${message}`;

  await pool.query(
    `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, 'assistant', $2)
    `,
    [conversationId, reply]
  );

  res.json({
    role: 'assistant',
    content: reply,
  });
});

export default router;
