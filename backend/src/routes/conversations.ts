// import { Router } from 'express';
// import { pool } from '../db/pool';
// import { requireAuth } from '../middleware/auth';

// const router = Router();
// router.use(requireAuth);

// router.get('/', async (req, res) => {
//   const result = await pool.query(
//     `
//     SELECT id, title, created_at
//     FROM conversations
//     WHERE user_id = $1
//     ORDER BY created_at DESC
//     `,
//     [req.userId]
//   );

//   res.json(result.rows);
// });

// router.post('/', async (req, res) => {
//   const { title = 'New Chat' } = req.body;

//   const result = await pool.query(
//     `
//     INSERT INTO conversations (user_id, title)
//     VALUES ($1, $2)
//     RETURNING id, title, created_at
//     `,
//     [req.userId, title]
//   );

//   res.status(201).json(result.rows[0]);
// });

// router.patch('/:id', async (req, res) => {
//   await pool.query(
//     `
//     UPDATE conversations
//     SET title = $1
//     WHERE id = $2 AND user_id = $3
//     `,
//     [req.body.title, req.params.id, req.userId]
//   );

//   res.sendStatus(204);
// });

// export default router;
