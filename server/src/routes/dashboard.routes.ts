import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types';
import { getDashboardSummary } from '../controllers/dashboard.controller';

const router = Router();

/**
 * Route: GET /api/dashboard/summary
 * Inherits standard JSON Web Token protections via `authenticate`, parsing session boundaries.
 */
/**
 * Route: GET /api/dashboard/summary
 * Blocks raw Role.VIEWER interactions, funneling Analytics only toward Analysts/Admins
 */
router.get('/summary', authenticate, authorizeRoles(Role.ANALYST, Role.ADMIN), getDashboardSummary);

export default router;
