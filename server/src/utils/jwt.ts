import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Interface detailing the strictly expected properties safely encapsulated inside our JWT.
 */
export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Securely generates a JSON Web Token payload to authenticate future HTTP requests.
 * 
 * @param userId - Extracted MongoDB `_id` tied to the user session
 * @param role - The configured Role permission block attached to the user scope
 * @returns string - Strongly encrypted output valid for exactly 1 day
 */
export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  // Runtime boundary check effectively preventing the system from initializing weak tokens
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: process.env.JWT_SECRET is completely missing!');
  }

  const payload: TokenPayload = { userId, role };
  const options: SignOptions = { expiresIn: '1d' };

  // Executes standard SHA-based token signature hashing
  return jwt.sign(payload, secret, options);
};

/**
 * Decodes and deeply verifies the raw string token presented within user requests.
 * 
 * @param token - String-based JWT payload originating from the authorization headers
 * @returns TokenPayload - Type-safe structural representation of the decoded internal parameters
 * @throws Error cleanly terminating execution pipelines upon identifying tampered/stale sessions
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: process.env.JWT_SECRET is completely missing!');
  }

  try {
    // Explicitly casting verify returns immediately into our structured generic
    const decodedPayload = jwt.verify(token, secret) as TokenPayload;
    return decodedPayload;
  } catch (error) {
    // Gracefully catch standard generic jsonwebtoken error manifestations 
    // wrapping them with our application's consistent error pattern 
    throw new Error('Unauthorized Authorization Block: The provided access token is corrupted or expired.');
  }
};
