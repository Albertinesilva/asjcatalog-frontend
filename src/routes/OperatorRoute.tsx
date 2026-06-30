import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

export default function OperatorRoute() {
  const { authenticated, loading } = useAuth();
  const { isOperator } = useRoles();

  if (loading) {
    return <div className="container py-5 text-center text-muted">Carregando...</div>;
  }
  if (!authenticated) return <Navigate to="/auth/login" replace />;
  if (!isOperator) return <Navigate to="/" replace />;
  return <Outlet />;
}
