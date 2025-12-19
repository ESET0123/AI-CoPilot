// import { Router } from 'express';
// import { pool } from '../db/pool';
// import { requireAuth } from '../middleware/auth';

// const router = Router();
// router.use(requireAuth);

// router.get('/:conversationId', async (req, res) => {
//   const result = await pool.query(
//     `
//     SELECT role, content, created_at
//     FROM messages
//     WHERE conversation_id = $1
//     ORDER BY created_at
//     `,
//     [req.params.conversationId]
//   );

//   res.json(result.rows);
// });

// router.post('/', async (req, res) => {
//   const { conversationId, message } = req.body;

//   await pool.query(
//     `
//     INSERT INTO messages (conversation_id, role, content)
//     VALUES ($1, 'user', $2)
//     `,
//     [conversationId, message]
//   );

//   const reply = `You said: ${message}`;

//   await pool.query(
//     `
//     INSERT INTO messages (conversation_id, role, content)
//     VALUES ($1, 'assistant', $2)
//     `,
//     [conversationId, reply]
//   );

//   res.json({
//     role: 'assistant',
//     content: reply,
//   });
// });

// export default router;
