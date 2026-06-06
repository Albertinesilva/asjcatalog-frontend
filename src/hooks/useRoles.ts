import { useAuth } from "./useAuth";
import type { Role } from "@/types";

export function useRoles() {
  const { roles } = useAuth();

  const hasRole = (role: Role) => roles.includes(role);
  const hasAnyRole = (allowed: Role[]) =>
    allowed.length === 0 || allowed.some((r) => roles.includes(r));

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole("ROLE_ADMIN"),
    isOperator: hasRole("ROLE_OPERATOR") || hasRole("ROLE_ADMIN"),
  };
}