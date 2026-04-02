/**
 * Role-Based Access Control (RBAC) Roles
 * Defines the hierarchy and access privileges for users across the finance dashboard.
 * 
 * Uses string-based enums for database clarity and simpler frontend integrations.
 */
export enum Role {
  /**
   * Has basic access to view financial transactions.
   * Restricted from viewing aggregated dashboard summaries or any write operations.
   */
  VIEWER = 'VIEWER',

  /**
   * Can view all transaction logs and access high-level dashboard summaries.
   * Restrict from any write operations (Create, Update, Delete).
   */
  ANALYST = 'ANALYST',

  /**
   * Full administrative control. Can view all data, manage financial records 
   * (Create, Update, Delete), and manage user accounts (list, update role/status).
   */
  ADMIN = 'ADMIN',
}
