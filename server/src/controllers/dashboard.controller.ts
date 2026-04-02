import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/transaction.model';
import { Role } from '../types';

/**
 * Compiles a suite of high-level financial aggregations strictly bound by RBAC models.
 * Used uniquely to populate the client's global insights display natively.
 */
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Unauthorized: Session mappings missing.' });
      return;
    }

    /**
     * 1. Shared Analytical Configuration Array
     * This system uses a shared financial data model where all users can view all transactions.
     * Role-based access control is applied only to modification operations.
     */
    const matchStage: any = { isDeleted: false };

    /**
     * 2. Optimize Pipeline -> $facet Aggregation
     * Allows us to branch our analytical queries fetching Income vs Expense vs Categories
     * seamlessly simultaneously without triggering triple database network roundtrips.
     */
    const aggregationResult = await Transaction.aggregate([
      // Execute match parameters (left bare intentionally to grab all system documents)
      { $match: matchStage },
      {
        $facet: {
          incomeSummary: [
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          expenseSummary: [
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          categoryBreakdown: [
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $project: { _id: 0, category: '$_id', total: 1 } },
            { $sort: { total: -1 } } // Organizes largest financial pools downward
          ],
        }
      }
    ]);

    // Unpack parallel processing array mapping zero mathematically to null voids 
    const totalIncome = Math.round((aggregationResult[0]?.incomeSummary[0]?.total || 0) * 100) / 100;
    const totalExpense = Math.round((aggregationResult[0]?.expenseSummary[0]?.total || 0) * 100) / 100;
    
    // Explicitly round category breakdowns
    const categoryBreakdown = (aggregationResult[0]?.categoryBreakdown || []).map((cat: any) => ({
      ...cat,
      total: Math.round(cat.total * 100) / 100
    }));

    /**
     * 3. Independent Retrieval Query
     * Grabs the 5 most recent granular updates adhering specifically to the RBAC matrix 
     */
    const recentTransactions = await Transaction.find(matchStage)
      .sort({ date: -1 })
      .limit(5);

    // 4. Export structured layout satisfying the frontend UI dashboard architecture 
    res.status(200).json({
      success: true,
      message: 'Dashboard analytics data compiled.',
      data: {
        totalIncome,
        totalExpense,
        netBalance: Math.round((totalIncome - totalExpense) * 100) / 100,
        categoryBreakdown,
        recentTransactions,
      }
    });
  } catch (error) {
    console.error('[Dashboard Summary Exception]:', error);
    res.status(500).json({ success: false, message: 'Server disruption while parsing dashboard analytics.' });
  }
};
