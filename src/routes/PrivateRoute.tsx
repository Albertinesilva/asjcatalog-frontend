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
      <div className="container py-5 text-center text-muted">Carregando...</div>
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
