import { Router } from 'express';
import { pool } from '../db/pool';

const router = Router();

// Main health check - includes database connectivity
router.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    console.error('[Health] Database connection failed:', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      message: 'Database connection failed'
    });
  }
});

// Detailed database check
router.get('/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS ok');
    res.json({
      status: 'ok',
      db: result.rows[0],
    });
  } catch (err) {
    console.error('[Health] Database check error:', err);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

export default router;
