import { Request, Response } from 'express';

// TODO: Map these functions strictly against Mongoose later!
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  res.status(201).json({ message: 'Create Transaction executed - Admin Access Only!' });
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Get Transactions executed - Accessed globally by authorized accounts.' });
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Update Transaction executed - Admin Access Only!' });
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Delete Transaction executed - Admin Access Only!' });
};
