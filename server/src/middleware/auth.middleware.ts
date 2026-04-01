import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

/**
 * Augment the standard Express Request interface namespace globally
 * to gracefully allow TypeScript typing over our securely attached user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

/**
 * Authenticate Middleware
 * 
 * Mock implementation to bypass hard security configurations while the application structures
 * are being wired up. Later, this will actively extract algorithms like JSON Web Tokens (JWT).
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // TODO: Implement proper JWT token parsing from authorization headers here

  // Mocking an authenticated user configuration to test RBAC logic quickly
  req.user = {
    id: '507f1f77bcf86cd799439011', // A simulated 24 character MongoDB Hex string
    role: Role.ADMIN, // Configured to simulate top-level system access automatically
  };

  // Yield runtime to the consecutive application logic layer
  next();
};

/**
 * Authorize Roles Middleware Factory
 * 
 * A curried, highly reusable validation factory. Pass any permutations of permitted enum roles,
 * and the subsequent logic safely shields controllers against under-privileged accounts.
 * 
 * @example
 * router.post('/transactions', authenticate, authorizeRoles(Role.ADMIN, Role.ANALYST), ...)
 */
export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    
    // Failsafe condition ensuring this middleware is used *after* authentication occurs
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: No active authentication detected.' });
      return;
    }

    // RBAC Permissions Check
    // Prohibits proceeding if the injected session role defaults fall outside authorized perimeters
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden: You do not have sufficient permissions to perform this action.' 
      });
      return;
    }

    // Securely routes traffic onward to its actual intended API destination
    next();
  };
};
