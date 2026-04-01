import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller';
import { Role } from '../types';

const router = Router();

/**
 * Global Router Middleware
 * By mounting `authenticate` at the router level, *every* request inside 
 * /api/transactions will be natively required to contain a cryptographically valid JWT.
 */
router.use(authenticate);

/**
 * Create Transaction
 * Security Scope: ADMIN ONLY
 */
router.post(
  '/',
  authorizeRoles(Role.ADMIN),
  createTransaction
);

/**
 * Read Transactions
 * Security Scope: ALL ROLES (Viewer, Analyst, Admin)
 * Later, the controller can use req.user.role to natively restrict 
 * exactly which documents Analyst vs. Viewers are allowed to extract!
 */
router.get(
  '/',
  authorizeRoles(Role.VIEWER, Role.ANALYST, Role.ADMIN),
  getTransactions
);

/**
 * Update Transaction
 * Security Scope: ADMIN ONLY
 */
router.put(
  '/:id',
  authorizeRoles(Role.ADMIN),
  updateTransaction
);

/**
 * Delete Transaction
 * Security Scope: ADMIN ONLY
 */
router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN),
  deleteTransaction
);

export default router;
