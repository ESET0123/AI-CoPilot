// import { Router } from 'express';
// import { pool } from '../db/pool';
// import { requireAuth } from '../middleware/auth';

// const router = Router();
// router.use(requireAuth);

// /* ================= GET MESSAGES ================= */
// router.get('/:conversationId', async (req, res) => {
//   try {
//     const { conversationId } = req.params;
//     const userId = req.userId!;

//     // ownership check
//     const convo = await pool.query(
//       `
//       SELECT id FROM conversations
//       WHERE id = $1 AND user_id = $2
//       `,
//       [conversationId, userId]
//     );

//     if (!convo.rowCount) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     const result = await pool.query(
//       `
//       SELECT role, content, created_at
//       FROM messages
//       WHERE conversation_id = $1
//       ORDER BY created_at
//       `,
//       [conversationId]
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error('GET /messages error:', err);
//     res.status(500).json({ message: 'Failed to load messages' });
//   }
// });

// /* ================= SEND MESSAGE ================= */
// router.post('/', async (req, res) => {
//   try {
//     const { conversationId, message } = req.body;
//     const userId = req.userId!;

//     if (!conversationId || !message) {
//       return res.status(400).json({ message: 'Invalid payload' });
//     }

//     // ownership check
//     const convo = await pool.query(
//       `
//       SELECT id FROM conversations
//       WHERE id = $1 AND user_id = $2
//       `,
//       [conversationId, userId]
//     );

//     if (!convo.rowCount) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     // store user message
//     await pool.query(
//       `
//       INSERT INTO messages (conversation_id, role, content)
//       VALUES ($1, 'user', $2)
//       `,
//       [conversationId, message]
//     );

//     // mock assistant reply
//     const reply = `You said: ${message}`;

//     await pool.query(
//       `
//       INSERT INTO messages (conversation_id, role, content)
//       VALUES ($1, 'assistant', $2)
//       `,
//       [conversationId, reply]
//     );

//     res.json({
//       role: 'assistant',
//       content: reply,
//     });
//   } catch (err) {
//     console.error('POST /messages error:', err);
//     res.status(500).json({ message: 'Failed to send message' });
//   }
// });

// export default router;


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
