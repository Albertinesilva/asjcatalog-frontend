import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components";

/**
 * Guard de AUTENTICAÇÃO apenas. Autorização por roles fica em `RoleRoute`.
 */
export default function PrivateRoute() {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState />;
  if (!authenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
