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

export default router;
