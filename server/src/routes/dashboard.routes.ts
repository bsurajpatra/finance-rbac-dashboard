import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getDashboardSummary } from '../controllers/dashboard.controller';

const router = Router();

/**
 * Route: GET /api/dashboard/summary
 * Inherits standard JSON Web Token protections via `authenticate`, parsing session boundaries.
 */
router.get('/summary', authenticate, getDashboardSummary);

export default router;
