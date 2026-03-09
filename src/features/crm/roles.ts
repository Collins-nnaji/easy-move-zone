import type { RoleKey } from "./types";

export const ROLE_PERMISSIONS: Record<RoleKey, string[]> = {
  admin: ["prospects:read", "prospects:write", "clients:read", "clients:write", "threads:read", "threads:write"],
  sales_manager: ["prospects:read", "prospects:write", "clients:read", "clients:write", "threads:read", "threads:write"],
  sales_rep: ["prospects:read", "prospects:write", "clients:read", "threads:read", "threads:write"],
  client: ["threads:read", "threads:write"],
};

export function hasPermission(userRoles: RoleKey[], permission: string): boolean {
  return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function requirePermission(userRoles: RoleKey[], permission: string): void {
  if (!hasPermission(userRoles, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
