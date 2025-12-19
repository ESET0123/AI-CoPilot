import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

/* GET messages */
router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  const result = await pool.query(
    `
    SELECT role, content, created_at
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at
    `,
    [conversationId]
  );

  res.json(result.rows);
});

/* SEND message */
router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;

  // store user message
  await pool.query(
    `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, 'user', $2)
    `,
    [conversationId, message]
  );

  // mock assistant reply
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
