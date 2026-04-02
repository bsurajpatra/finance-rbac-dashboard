import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { Role } from '../types';

/**
 * Automates the deployment of a foundational Administrator identity
 * executing strictly against virgin database structures establishing initial RBAC configurations.
 */
export const seedAdminUser = async (): Promise<void> => {
  try {
    // 1. Investigate the schema confirming an Admin node doesn't already naturally exist
    const adminExists = await User.findOne({ role: Role.ADMIN });

    if (adminExists) {
      console.log('[Seed System] Matrix already maintains active Administrator logic limits. Skipping.');
      return;
    }

    // 2. Inherit environment properties natively defaulting conditionally
    const adminName = 'System Administrator';
    const adminEmail = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !rawPassword) {
      console.log('[Seed System] Missing ADMIN_EMAIL or ADMIN_PASSWORD environment payload. Skipping deployment.');
      return;
    }

    // 3. Robust Cryptographic Signature generation natively securing the payload
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 4. Commit the new identity firmly into Mongoose layers mapping default capabilities
    await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    });

    console.log(`[Seed Successful] Bootstrapped structural root Admin targeted at: ${adminEmail}`);
  } catch (error) {
    console.error('[Seed Error] Failed to map foundational root identity:', error);
  }
};
