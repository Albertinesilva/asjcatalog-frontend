import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";

export default function OperatorRoute() {
  const { authenticated } = useAuth();
  const { isOperator } = useRoles();

  if (!authenticated) return <Navigate to="/auth/login" replace />;
  if (!isOperator) return <Navigate to="/" replace />;
  return <Outlet />;
}
