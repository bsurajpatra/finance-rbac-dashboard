import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { getUsers, updateUserRole, updateUserStatus } from '../controllers/user.controller';
import { Role } from '../types';

const router = Router();

// Globally guard all internal endpoints securely forcing Admin presence.
// Ensures logic naturally rejects unprivileged Analyst or Viewer payloads entirely.
router.use(authenticate, authorizeRoles(Role.ADMIN));

router.get('/', getUsers);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

export default router;
