import type { ReactNode } from "react";
import { useRoles } from "@/hooks/useRoles";
import type { Role } from "@/types";

type AuthorizationProps = {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Renderiza `children` apenas se o usuário possuir QUALQUER uma das roles.
 * Equivalente ao componente <Authorization /> descrito na especificação.
 *
 * Lembrete: o backend continua sendo a proteção real — este componente
 * apenas oculta elementos da UI (menus, botões, links).
 */
export default function Authorization({ roles, children, fallback = null }: AuthorizationProps) {
  const { hasAnyRole } = useRoles();
  return <>{hasAnyRole(roles) ? children : fallback}</>;
}
