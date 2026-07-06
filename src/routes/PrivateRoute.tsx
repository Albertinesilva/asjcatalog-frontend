import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

type PrivateRouteProps = {
  roles?: Role[];
};

export default function PrivateRoute({ roles }: PrivateRouteProps = {}) {
  const { authenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] py-2xl px-md text-center text-foreground-muted">
        Carregando...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
