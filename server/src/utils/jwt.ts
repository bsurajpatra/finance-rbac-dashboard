import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Interface detailing the strictly expected properties safely encapsulated inside our JWT.
 */
export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generates a short-lived Access Token for primary API interactions.
 * 
 * @param userId - Extracted MongoDB `_id` tied to the user session
 * @param role - The configured Role permission block attached to the user scope
 * @returns string - Strongly encrypted output valid for exactly 15 minutes
 */
export const generateAccessToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('FATAL SECURITY ERROR: JWT_SECRET missing!');

  const payload: TokenPayload = { userId, role };
  return jwt.sign(payload, secret, { expiresIn: '15m' });
};

/**
 * Generates a long-lived Refresh Token strictly for session rotation logic.
 * 
 * @param userId - Extracted MongoDB `_id` tied to the user session
 * @returns string - Strongly encrypted output valid for 7 days
 */
export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('FATAL SECURITY ERROR: JWT_SECRET missing!');

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

/**
 * Decodes and deeply verifies the raw string token presented within user requests.
 * 
 * @param token - String-based JWT payload originating from the authorization headers
 * @param isRefresh - Whether we are verifying a Refresh Token (uses different secret check)
 */
export const verifyToken = (token: string, isRefresh: boolean = false): any => {
  const secret = isRefresh 
    ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    : process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: process.env.JWT_SECRET is completely missing!');
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(`Unauthorized: The provided ${isRefresh ? 'refresh' : 'access'} token is corrupted or expired.`);
  }
};
