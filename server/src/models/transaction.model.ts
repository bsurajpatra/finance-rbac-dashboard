import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Interface representing a Transaction document in MongoDB.
 * Extends mongoose.Document ensuring robust TypeScript autocompletion and type checking.
 */
export interface ITransaction extends Document {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema defining the structure, validation constraints, and defaults
 * for financial transactions in the dashboard.
 */
const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      // Strictly enforces positive numbers preventing invalid transaction entries
      min: [0.01, 'Amount must be a positive number greater than zero'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a supported transaction type',
      },
    },
    category: {
      type: String,
      required: [true, 'Transaction category is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now, // Defaults to the current execution time when created
    },
    note: {
      type: String,
      trim: true,
    },
    /**
     * createdBy links the Transaction directly to a User.
     * This relationship is fundamental for the RBAC architecture, allowing:
     * - Viewers to query and analyze aggregate data safely.
     * - Analysts to drill down into localized user data.
     * - Security logic limiting modifications exclusively to owned records.
     */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Establishes relation with the "User" Mongoose model
      required: [true, 'A transaction must strictly belong to a User'],
    },
  },
  {
    timestamps: true, // Out-of-the-box management of createdAt and updatedAt dates
  }
);

/**
 * The generalized Transaction model mapped back to our strict interface specifications.
 */
const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
