import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';

/**
 * Registers a new user into the database securely.
 * Automatically hashes the password and assigns the default VIEWER role.
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // 1. Strict Validation of required fields
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please provide all required fields: name, email, and password.' });
      return;
    }

    // 2. Prevent Duplicate Accounts
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email address already exists.' });
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
      message: 'User registered successfully!',
      user: userResponse,
    });
  } catch (error) {
    console.error('[Register User Error]:', error);
    res.status(500).json({ error: 'Internal Server Error encountered during registration.' });
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
      res.status(400).json({ error: 'Please provide both email and password for login.' });
      return;
    }

    // 2. Query Existing User Record
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 401 Unauthorized for security ambiguity
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // 3. Cryptographic Password Comparison
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // 4. JWT Generation
    const token = generateToken(user._id.toString(), user.role);

    // 5. Output Safe Payload (Excluding Password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('[Login User Error]:', error);
    res.status(500).json({ error: 'Internal Server Error encountered during login.' });
  }
};
