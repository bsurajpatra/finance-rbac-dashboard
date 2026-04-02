import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';

/**
 * Registers a new user into the database securely.
 * Automatically hashes the password and assigns the default VIEWER role.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Strict Validation of required fields
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields: name, email, and password.' });
      return;
    }

    // 2. Prevent Duplicate Accounts
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
      return;
    }

    // 3. Secure Password Hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create User Record (Defaults to Role.VIEWER via Mongoose Schema)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 5. Build Safe Response (Excluding Password Hash!)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('[Register User Error]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error encountered during registration.' });
  }
};

/**
 * Authenticates an existing user returning a securely signed JWT payload.
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password for login.' });
      return;
    }

    // 2. Query Existing User Record
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 401 Unauthorized for security ambiguity
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 2.5 Ensure the account hasn't been structurally suspended by an administrator
    if (user.isActive === false) {
      res.status(403).json({ success: false, message: 'Forbidden: User account is inactive or disabled.' });
      return;
    }

    // 3. Cryptographic Password Comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 4. Dual Token Generation (15m Access / 7d Refresh)
    const token = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // 5. Output Safe Payload (Excluding Password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        refreshToken,
        user: userResponse,
      }
    });
  } catch (error) {
    console.error('[Login User Error]:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error encountered during login.' });
  }
};

/**
 * Validates a Refresh Token and issues a fresh 15-minute Access Token.
 * Prevents continuous re-authentication UX friction while maintaining high security.
 */
export const rotateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Missing refresh token payload.' });
      return;
    }

    // Explicitly verify against the refresh secret
    const decoded = verifyToken(refreshToken, true);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(403).json({ success: false, message: 'Forbidden: Valid user account not identified.' });
      return;
    }

    // Issue fresh Access Token
    const token = generateAccessToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Token rotation successful.',
      data: { token },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized: Refresh token is invalid or expired.' });
  }
};
