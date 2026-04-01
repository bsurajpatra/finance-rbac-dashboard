import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { Role } from '../types';

/**
 * Augment the standard Express Request interface namespace globally
 * to gracefully allow TypeScript typing over our securely attached user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

/**
 * Authenticate Middleware
 * 
 * Secures routes by natively reading standard "Bearer" authorization headers,
 * securely cryptographically validating their JWT payload against the signature,
 * and mapping the decoded document to `req.user` before continuing execution logic.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Read Authorization header
    const authHeader = req.header('Authorization');

    // 2. Client Input Security Validations
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header.' });
      return;
    }

    // 3. Safely Extract token isolating it from "Bearer " prefix
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Missing token string.' });
      return;
    }

    // 4. Synchronously verify token validity dynamically pulling from system environment scopes
    const decoded = verifyToken(token);

    // 5. Hydrate Request context for subsequent chained middleware elements automatically
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // 6. Push runtime execution over to the following matched stack routine
    next();
  } catch (error) {
    // Protect against token staleness (expiresIn) and cryptographic falsifications safely
    console.error('[JWT Auth Middleware Error]:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
  }
};

/**
 * Authorize Roles Middleware Factory
 * 
 * Leverages currying patterns mapping deeply to strict application enums 
 * establishing localized security layers that shield specific routes from 
 * under-privileged interactions out of scope.
 * 
 * @example
 * router.delete('/financials', authenticate, authorizeRoles(Role.ADMIN), controllerLogic)
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Strictly requires placement execution after the root 'authenticate' wrapper logic
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Unable to map identity.' });
      return;
    }

    // Dynamically analyzes authenticated scopes isolating parameters to explicitly permitted enumerations
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Forbidden: Insufficient privileges to access this resource.' 
      });
      return;
    }

    next();
  };
};
