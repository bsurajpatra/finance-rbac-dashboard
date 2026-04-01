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
      res.status(401).json({ error: 'Unauthorized: Session mappings missing.' });
      return;
    }

    /**
     * 1. RBAC Matrix Filter Initialization
     * We map the `createdBy` boundary specifically as a native `mongoose.Types.ObjectId`.
     * Unlike `find()`, standard MongoDB aggregations do not cast strings dynamically,
     * so it must be structurally enforced here to avoid silent aggregation failures.
     */
    const matchStage: any = {};
    if (userRole !== Role.ADMIN) {
      matchStage.createdBy = new mongoose.Types.ObjectId(userId);
    }

    /**
     * 2. Optimize Pipeline -> $facet Aggregation
     * Allows us to branch our analytical queries fetching Income vs Expense vs Categories
     * seamlessly simultaneously without triggering triple database network roundtrips.
     */
    const aggregationResult = await Transaction.aggregate([
      // Execute strict role-based permission isolation BEFORE compiling any statistics
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
    const totalIncome = aggregationResult[0]?.incomeSummary[0]?.total || 0;
    const totalExpense = aggregationResult[0]?.expenseSummary[0]?.total || 0;
    const categoryBreakdown = aggregationResult[0]?.categoryBreakdown || [];

    /**
     * 3. Independent Retrieval Query
     * Grabs the 5 most recent granular updates adhering specifically to the RBAC matrix 
     */
    const recentTransactions = await Transaction.find(matchStage)
      .sort({ date: -1 })
      .limit(5);

    // 4. Export structured layout satisfying the frontend UI dashboard architecture 
    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('[Dashboard Summary Exception]:', error);
    res.status(500).json({ error: 'Server disruption while parsing dashboard analytics.' });
  }
};
