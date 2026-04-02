import { Request, Response } from 'express';
import Transaction from '../models/transaction.model';
import { Role } from '../types';

/**
 * Creates a new financial transaction instance.
 * Route Guard Context: ADMIN ONLY (Enforced natively via Router)
 */
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type, category, date, note } = req.body;

    // 1. Explicit Property Validation
    if (amount === undefined || !type || !category) {
      res.status(400).json({ error: 'Please submit all required properties: amount, type, and category.' });
      return;
    }

    // 2. Session Context Resolution
    const userId = req.user?.userId;
    if (!userId) {
       // Deeply corrupted session map
      res.status(401).json({ error: 'Unauthorized: Internal identity map missing.' });
      return;
    }

    // 3. Initiate MongoDB Record Generation
    const newTransaction = await Transaction.create({
      amount,
      type,
      category,
      date,
      note,
      createdBy: userId, // Strongly linking the action context purely from the backend JWT signature
    });

    res.status(201).json({
      message: 'Transaction successfully processed and recorded.',
      transaction: newTransaction,
    });
  } catch (error: any) {
    console.error('[Create Transaction Exception]:', error);
    // Graceful routing of native MongoDB/Mongoose formatting errors
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'A critical Server Error interrupted the transaction creation.' });
  }
};

/**
 * Queries the database selectively pulling transactions bound dynamically against RBAC logic.
 * Also processes custom query filters dynamically (type, category, dates).
 * Route Guard Context: GLOBAL ACCESS (Viewers, Analysts, Admins)
 */
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Validate security scope presence
    if (!userId || !userRole) {
      res.status(401).json({ error: 'Unauthorized: Session details missing.' });
      return;
    }

    /**
     * 1. Initialize Dynamic Query Filter
     * We type assert correctly to map MongoDB parameters smoothly.
     */
    const filter: any = { isDeleted: false }; // Exclude soft-deleted records from all global lookups

    // Apply URL Query Parameters if provided
    const { type, category, startDate, endDate } = req.query;

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    // Safely parse date structures preventing invalid injections from halting the server
    if (startDate || endDate) {
      filter.date = {};
      
      if (startDate && !isNaN(Date.parse(startDate as string))) {
        filter.date.$gte = new Date(startDate as string);
      }
      
      if (endDate && !isNaN(Date.parse(endDate as string))) {
        filter.date.$lte = new Date(endDate as string);
      }
      
      // Clean up empty date objects avoiding Mongoose mapping exceptions
      // Occurs if the user provides poorly formatted, invalid date strings
      if (Object.keys(filter.date).length === 0) {
        delete filter.date;
      }
    }

    /**
     * 2. RBAC Configuration Note
     * This system uses a shared financial data model where all users can view all transactions.
     * Role-based access control is applied only to modification operations.
     */
    // Restricting `filter.createdBy` has been removed to allow organizational wide reads.

    /**
     * 3. Pagination & Execution Logic
     * Dynamically map query parameters for performant windowed data retrieval.
     */
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    // 4. Extract mapped elements returning them logically ordered chronologically 
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      message: 'Payload generation successful.',
      count: transactions.length,
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('[Fetch Transactions Exception]:', error);
    res.status(500).json({ error: 'Internal Data Retrieval Error.' });
  }
};

/**
 * Edits transactional data dynamically avoiding schema corruption.
 * Route Guard Context: ADMIN ONLY (Enforced natively via Router)
 */
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id;
    const updatePayload = req.body;

    if (!transactionId) {
      res.status(400).json({ error: 'Invalid URL Format: Target Transaction ID is mandatory.' });
      return;
    }

    /**
     * { new: true } = Return the post-mutation JSON payload instead of the old configuration
     * { runValidators: true } = Reactivates schema type enforcement preventing string pushes onto Numeric blocks
     */
    const updatedDocument = await Transaction.findByIdAndUpdate(
      transactionId, 
      updatePayload, 
      { new: true, runValidators: true }
    );

    // Document mapped natively as missing
    if (!updatedDocument) {
      res.status(404).json({ error: 'Transaction ID failed to reference an active resource.' });
      return;
    }

    res.status(200).json({
      message: 'Transaction mutation accepted and propagated.',
      transaction: updatedDocument,
    });
  } catch (error: any) {
    console.error('[Update Transaction Exception]:', error);
    if (error.name === 'CastError' || error.name === 'ValidationError') {
      res.status(400).json({ error: 'Failed constraint validation checks over mutated fields.' });
      return;
    }
    res.status(500).json({ error: 'Server disruption interrupted the update logic.' });
  }
};

/**
 * Clears the identified transaction out of local memory boundaries permanently.
 * Route Guard Context: ADMIN ONLY (Enforced natively via Router)
 */
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = req.params.id;

    if (!transactionId) {
      res.status(400).json({ error: 'Invalid URL Format: Target Transaction ID is mandatory.' });
      return;
    }

    // Soft delete: Flag the record instead of physical purge
    const removedDocument = await Transaction.findByIdAndUpdate(
      transactionId,
      { isDeleted: true },
      { new: true }
    );

    if (!removedDocument) {
      res.status(404).json({ error: 'Transaction not found. No modifications occurred.' });
      return;
    }

    res.status(200).json({
      message: 'Transaction successfully deactivated. Record preserved in audit log.',
      id: transactionId,
    });
  } catch (error: any) {
    console.error('[Delete Transaction Exception]:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Malformed MongoDB Identity Format.' });
      return;
    }
    res.status(500).json({ error: 'Internal Server Error detected during database purge.' });
  }
};
