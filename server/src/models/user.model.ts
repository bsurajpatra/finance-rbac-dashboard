import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '../types';

/**
 * Interface representing a User document.
 * Inherits standard MongoDB document properties like _id and save() from mongoose.Document.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema defining the structure, constraints, and defaults
 * for the User model within the Finance RBAC Dashboard.
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Ensures the database strictly prevents duplicate emails
      lowercase: true, // Normalizes email input for robust authentication
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      // Restricts the value strictly to the Role enum types defined in our RBAC system
      enum: {
        values: Object.values(Role),
        message: '{VALUE} is not a supported role',
      },
      required: true,
      default: Role.VIEWER, // Safest default fallback for new users
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically manages the generation of `createdAt` and `updatedAt` properties
    timestamps: true, 
  }
);

/**
 * Export the generalized User model to be consumed by controllers and services.
 */
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
