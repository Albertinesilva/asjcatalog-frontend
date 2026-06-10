import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

type PrivateRouteProps = {
  roles?: Role[];
};

export default function PrivateRoute({ roles }: PrivateRouteProps = {}) {
  const { authenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!authenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (roles && roles.length > 0 && !roles.some((r) => hasRole(r))) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}