import { Request, Response } from 'express';
import User from '../models/user.model';
import { Role } from '../types';

/**
 * Fetch a list of active platform users securely without leaking credentials.
 * Implements high-performance pagination and search filtering.
 * Route Guard: ADMIN ONLY
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Pagination Params extraction mapping mathematically
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    // 2. Dynamic Search construction
    const emailSearch = req.query.email as string;
    const nameSearch = req.query.name as string;

    const filter: any = {};
    if (emailSearch) {
      filter.email = { $regex: emailSearch, $options: 'i' }; // Case-insensitive wildcard matching
    }
    if (nameSearch) {
      filter.name = { $regex: nameSearch, $options: 'i' };
    }

    // 3. Database Execution
    // Strongly enforce `.select('-password')` so cryptographic hashes do not leak.
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      message: 'Active system users compiled successfully.',
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Get Users Exception]:', error);
    res.status(500).json({ error: 'A Server Error interrupted user retrieval.' });
  }
};

/**
 * Escalate or de-escalate account privileges natively editing the `role` enum.
 * Route Guard: ADMIN ONLY
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Strict validation protecting against corrupt roles bypassing the Schema definitions
    if (!role || !Object.values(Role).includes(role)) {
      res.status(400).json({ error: 'Malformed Data: Please specify a completely valid enum property (Viewer, Analyst, Admin).' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'Identified target user could not be found.' });
      return;
    }

    res.status(200).json({
      message: 'User clearance properly established.',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[Update Role Exception]:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Malformed MongoDB Identity payload formatting.' });
      return;
    }
    res.status(500).json({ error: 'Internal Server Error encountered while mutating security clearances.' });
  }
};

/**
 * Toggles structural active properties (Suspend/Activate Account).
 * Route Guard: ADMIN ONLY
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      res.status(400).json({ error: 'Malformed Data: The `isActive` boolean property is technically required.' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'Identified target user could not be found.' });
      return;
    }

    res.status(200).json({
      message: `User account successfully ${isActive ? 'activated' : 'suspended'}.`,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[Update Status Exception]:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Malformed MongoDB Identity payload formatting.' });
      return;
    }
    res.status(500).json({ error: 'Internal Server Error encountered while isolating accounts.' });
  }
};
