/**
 * Role-Based Access Control (RBAC) Roles
 * Defines the hierarchy and access privileges for users across the finance dashboard.
 * 
 * Uses string-based enums for database clarity and simpler frontend integrations.
 */
export enum Role {
  /**
   * Has read-only access to view financial dashboards, charts, and public metrics.
   * Cannot mutate data or view sensitive user configurations.
   */
  VIEWER = 'VIEWER',

  /**
   * Has read-write access to analyze data, generate internal reports, 
   * and update standard financial metrics.
   */
  ANALYST = 'ANALYST',

  /**
   * Superuser access. Has full administrative privileges, 
   * including user management, role reassignment, and system configuration.
   */
  ADMIN = 'ADMIN',
}
