import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { LoadingState } from "@/components";
import type { Role } from "@/types";

type Props = {
  /** Qualquer uma das roles listadas libera o acesso. Vazio = apenas autenticação. */
  roles?: Role[];
  /** Rota para onde redirecionar quando autenticado mas sem permissão. */
  redirectTo?: string;
};

/**
 * Guard genérico baseado em roles. Implementação única com
 * comportamento consistente de `loading` e redirect.
 */
export default function RoleRoute({ roles = [], redirectTo = "/dashboard" }: Props) {
  const { authenticated, loading } = useAuth();
  const { hasAnyRole } = useRoles();

  if (loading) return <LoadingState />;
  if (!authenticated) return <Navigate to="/auth/login" replace />;
  if (!hasAnyRole(roles)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}