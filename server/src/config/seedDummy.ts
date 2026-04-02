import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { Role } from '../types';

/**
 * Seeds dummy transactions to populate the dashboard and charts.
 * This function is intended to run on system bootstrapping only if the database is empty.
 */
export const seedDummyData = async (): Promise<void> => {
  try {
    // 1. Check if transactions already exist
    const txCount = await Transaction.countDocuments();
    if (txCount > 0) {
      console.log('[Seed Dummy Data] Transactions already exist. Skipping.');
      return;
    }

    // 2. Clear out existing non-admin users (Optional, but ensures fresh start for dummy data)
    // We keep our structural root admin!
    const admin = await User.findOne({ role: Role.ADMIN });
    if (!admin) {
      console.warn('[Seed Dummy Data] Root Admin not found. Cannot link transactions.');
      return;
    }

    console.log('[Seed Dummy Data] Injecting synthetic financial traces...');

    // 3. Define dummy categories and types
    const categories = ['Software License', 'Cloud Infrastructure', 'Marketing', 'Dividends', 'Operational Payroll', 'Consulting Fees', 'Office Rent', 'Travel'];
    const types = ['income', 'expense'];

    // 4. Generate a diverse array of transactions over the last 3 months
    const dummyTransactions = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = parseFloat((Math.random() * (type === 'income' ? 5000 : 1500)).toFixed(2));
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Random date within the last 90 days
      const date = new Date(now.getTime() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000));

      dummyTransactions.push({
        amount,
        type,
        category,
        date,
        note: `Synthetic Trace #${i + 1} - Automated Data Seeding`,
        createdBy: admin._id,
        isDeleted: false
      });
    }

    // 5. Bulk insert to MongoDB via Mongoose
    await Transaction.insertMany(dummyTransactions);

    console.log(`[Seed Successful] Injected ${dummyTransactions.length} dummy transactions into the matrix.`);
  } catch (error) {
    console.error('[Seed Error] Failed to map dummy transactions:', error);
  }
};
