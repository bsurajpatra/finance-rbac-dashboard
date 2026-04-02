import { Router } from 'express';
import { registerUser, loginUser, rotateToken } from '../controllers/auth.controller';

const router = Router();

// Route: POST /api/auth/register
// Registers a new user with standard credentials and assigns the default Viewer role.
router.post('/register', registerUser);

// Route: POST /api/auth/login
// Authenticates credentials dynamically via bcrypt comparing, returning a JWT token payload.
router.post('/login', loginUser);

export default router;
