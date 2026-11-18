import { Router } from 'express';
import { getDBStatus } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    message: 'System is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
});

export default router;
