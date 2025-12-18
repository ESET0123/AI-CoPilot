import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

/* ================= GET ALL CONVERSATIONS ================= */
router.get('/', async (req, res) => {
  const result = await pool.query(
    `
    SELECT id, title, created_at
    FROM conversations
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [(req as any).userId]
  );

  res.json(result.rows);
});

/* ================= CREATE CONVERSATION ================= */
router.post('/', async (req, res) => {
  const { title = 'New Chat' } = req.body;

  const result = await pool.query(
    `
    INSERT INTO conversations (user_id, title)
    VALUES ($1, $2)
    RETURNING id, title, created_at
    `,
    [(req as any).userId, title]
  );

  res.status(201).json(result.rows[0]);
});

/* ================= RENAME CONVERSATION ================= */
router.patch('/:id', async (req, res) => {
  const { title } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'Title required' });
  }

  const result = await pool.query(
    `
    UPDATE conversations
    SET title = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, title
    `,
    [title.trim(), req.params.id, (req as any).userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  res.json(result.rows[0]);
});

/* ================= DELETE CONVERSATION ================= */
router.delete('/:id', async (req, res) => {
  await pool.query(
    `
    DELETE FROM conversations
    WHERE id = $1 AND user_id = $2
    `,
    [req.params.id, (req as any).userId]
  );

  res.sendStatus(204);
});

export default router;
