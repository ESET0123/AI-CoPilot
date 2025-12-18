import { Router } from 'express';
import { pool } from '../db/pool';

const router = Router();

router.get('/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      db: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

export default router;
